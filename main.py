import datetime
import json
import requests
from random import Random
import hashlib
import sys
from PyQt5.QtWidgets import (QApplication, QMainWindow, QPushButton, QVBoxLayout, 
                            QWidget, QTextEdit, QRubberBand, QShortcut, QHBoxLayout, 
                            QLabel, QLineEdit, QToolTip, QMenuBar, QMenu, QDialog,
                            QFormLayout, QDialogButtonBox, QFileDialog, QSplitter,
                            QScrollArea, QFrame, QMessageBox, QKeySequenceEdit)
from PyQt5.QtCore import Qt, QRect, QSize, QTimer, QPoint, QThread, pyqtSignal, QSettings
from PyQt5.QtGui import QKeySequence, QPainter, QPen, QScreen, QColor, QPixmap, QImage
import tempfile
import os
import keyboard  # 需要先安装: pip install keyboard

SIMPLETEX_APP_ID = "vXSU9RyPMfUW4EQbgMWhzhQu"
SIMPLETEX_APP_SECRET = "GZiaGYq24U5evF9OXlcYIbZ2mwsuPbVu"

def random_str(randomlength=16):
    str = ''
    chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789'
    length = len(chars) - 1
    random = Random()
    for i in range(randomlength):
        str += chars[random.randint(0, length)]
    return str


def get_req_data(req_data, appid, secret):
    header = {}
    header["timestamp"] = str(int(datetime.datetime.now().timestamp()))
    header["random-str"] = random_str(16)
    header["app-id"] = appid
    
    # 确保 req_data 是字典类型
    if req_data is None:
        req_data = {}
    
    # 构建签名字符串
    params = []
    # 添加请求参数
    for key in sorted(req_data.keys()):
        params.append(f"{key}={req_data[key]}")
    # 添加头部参数
    for key in sorted(["timestamp", "random-str", "app-id"]):
        params.append(f"{key}={header[key]}")
    # 添加密钥
    params.append(f"secret={secret}")
    
    # 生成签名
    pre_sign_string = "&".join(params)
    header["sign"] = hashlib.md5(pre_sign_string.encode()).hexdigest()
    
    return header, req_data


class APISettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.parent = parent
        self.initUI()
        # 设置对话框字体
        self.setStyleSheet("""
            * {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
            }
            QLineEdit {
                padding: 3px 5px;
                min-width: 250px;
            }
            QDialogButtonBox {
                margin-top: 15px;
            }
        """)
        
    def initUI(self):
        self.setWindowTitle('API设置')
        self.setModal(True)
        layout = QFormLayout(self)
        
        # 创建输入框
        self.app_id_input = QLineEdit(self)
        self.app_secret_input = QLineEdit(self)
        
        # 设置当前值
        self.app_id_input.setText(SIMPLETEX_APP_ID)
        self.app_secret_input.setText(SIMPLETEX_APP_SECRET)
        
        # 添加到布局
        layout.addRow('APP ID:', self.app_id_input)
        layout.addRow('APP Secret:', self.app_secret_input)
        
        # 添加按钮
        buttons = QDialogButtonBox(
            QDialogButtonBox.Ok | QDialogButtonBox.Cancel,
            Qt.Horizontal, self)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)

class AboutDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('关于')
        self.setMinimumWidth(500)  # 增加最小宽度
        layout = QVBoxLayout(self)
        layout.setSpacing(15)  # 增加组件之间的间距
        
        # 软件名称
        title_label = QLabel('LaTeX公式识别工具')
        title_label.setStyleSheet("""
            QLabel {
                font-size: 18pt;
                font-weight: bold;
                color: #333;
                margin: 10px 0;
            }
        """)
        title_label.setAlignment(Qt.AlignCenter)
        
        # 版本信息
        version_label = QLabel('版本 1.0.3')
        version_label.setStyleSheet("""
            QLabel {
                font-size: 10pt;
                color: #666;
            }
        """)
        version_label.setAlignment(Qt.AlignCenter)
        
        # 描述信息
        desc_text = QTextEdit()
        desc_text.setReadOnly(True)
        desc_text.setHtml("""
            <p style='margin-bottom: 10px;'>这是一个简单的LaTeX公式识别工具，支持以下功能：</p>
            <ul style='margin-left: 20px; margin-bottom: 15px;'>
                <li>截图识别公式</li>
                <li>上传图片识别</li>
                <li>复制为多种格式</li>
                <li>历史记录保存</li>
            </ul>
            <p style='margin-bottom: 10px;'>使用 SimpleTex API 提供识别服务</p>
            <p style='color: #666;'>© 2024 All Rights Reserved</p>
        """)
        desc_text.setStyleSheet("""
            QTextEdit {
                background-color: transparent;
                border: none;
                font-size: 10pt;
                color: #444;
            }
        """)
        # 设置固定高度以显示所有内容
        desc_text.setFixedHeight(200)
        
        # 添加到布局
        layout.addWidget(title_label)
        layout.addWidget(version_label)
        layout.addWidget(desc_text)
        
        # 确定按钮
        button_box = QDialogButtonBox(QDialogButtonBox.Ok)
        button_box.accepted.connect(self.accept)
        button_box.setStyleSheet("""
            QPushButton {
                min-width: 80px;
                padding: 5px 15px;
            }
        """)
        layout.addWidget(button_box)
        
        # 设置对话框样式
        self.setStyleSheet("""
            QDialog {
                background-color: white;
            }
            * {
                font-family: "Microsoft YaHei";
            }
        """)

class RecognizeThread(QThread):
    finished = pyqtSignal(dict)  # 发送识别结果
    progress = pyqtSignal(str)   # 发送进度信息
    
    def __init__(self, image_path, app_id, app_secret):
        super().__init__()
        self.image_path = image_path
        self.app_id = app_id
        self.app_secret = app_secret
    
    def run(self):
        try:
            self.progress.emit("正在准备图片...")
            with open(self.image_path, 'rb') as file_obj:
                img_file = {"file": file_obj}
                data = {}
                
                self.progress.emit("正在生成请求参数...")
                header, data = get_req_data(data, self.app_id, self.app_secret)
                
                self.progress.emit("正在识别公式...")
                res = requests.post(
                    "https://server.simpletex.cn/api/latex_ocr", 
                    files=img_file, 
                    data=data, 
                    headers=header
                )
                
                self.progress.emit("正在解析结果...")
                result = json.loads(res.text)
                self.finished.emit(result)
                
        except Exception as e:
            self.finished.emit({"error": str(e)})

class HistoryDialog(QDialog):
    def __init__(self, history, parent=None):
        super().__init__(parent)
        self.history = history
        self.selected_latex = None
        self.selected_mode = 'normal'  # 添加复制模式属性
        self.initUI()
        
    def initUI(self):
        self.setWindowTitle('历史记录')
        self.setMinimumWidth(500)
        layout = QVBoxLayout(self)
        
        # 添加清空按钮
        clear_btn = QPushButton('清空历史记录')
        clear_btn.clicked.connect(self.clear_history)
        clear_btn.setStyleSheet("""
            QPushButton {
                background-color: #ff4d4d;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 3px;
                margin-bottom: 10px;
            }
            QPushButton:hover {
                background-color: #ff3333;
            }
        """)
        layout.addWidget(clear_btn, alignment=Qt.AlignRight)
        
        # 创建滚动区域
        scroll = QWidget()
        scroll_layout = QVBoxLayout(scroll)
        
        # 添加历史记录项
        for item in self.history:
            item_widget = QWidget()
            item_layout = QVBoxLayout(item_widget)
            
            # 日期标签
            date_label = QLabel(item['date'])
            date_label.setStyleSheet('color: #666; font-size: 9pt;')
            
            # LaTeX文本框
            latex_text = QTextEdit()
            latex_text.setPlainText(item['latex'])
            latex_text.setReadOnly(True)
            latex_text.setMaximumHeight(80)
            latex_text.setStyleSheet("""
                QTextEdit {
                    background-color: #f5f5f5;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    padding: 5px;
                }
            """)
            
            # 创建按钮布局
            buttons_layout = QHBoxLayout()
            
            # 添加删除按钮
            delete_btn = QPushButton('删除')
            delete_btn.setProperty('latex', item['latex'])
            delete_btn.clicked.connect(self.delete_item)
            delete_btn.setStyleSheet("""
                QPushButton {
                    background-color: #ff4d4d;
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    border-radius: 3px;
                }
                QPushButton:hover {
                    background-color: #ff3333;
                }
            """)
            
            # 创建使用按钮和菜单
            use_btn = QPushButton('使用此公式')
            use_menu = QMenu(self)
            
            # 添加复制选项
            normal_action = use_menu.addAction("使用原始代码")
            normal_action.setProperty('latex', item['latex'])
            normal_action.setProperty('mode', 'normal')
            normal_action.triggered.connect(self.use_formula)
            
            inline_action = use_menu.addAction("使用 $...$")
            inline_action.setProperty('latex', item['latex'])
            inline_action.setProperty('mode', 'inline')
            inline_action.triggered.connect(self.use_formula)
            
            display_action = use_menu.addAction("使用 $$...$$")
            display_action.setProperty('latex', item['latex'])
            display_action.setProperty('mode', 'display')
            display_action.triggered.connect(self.use_formula)
            
            # 设置默认动作和菜单
            use_btn.setMenu(use_menu)
            use_btn.clicked.connect(lambda checked, l=item['latex']: self.use_formula_default(l))
            
            use_btn.setStyleSheet("""
                QPushButton {
                    background-color: #1E90FF;
                    color: white;
                    border: none;
                    padding: 5px 15px;
                    border-radius: 3px;
                }
                QPushButton:hover {
                    background-color: #1873CC;
                }
                QPushButton::menu-indicator {
                    image: none;
                }
            """)
            
            buttons_layout.addWidget(delete_btn)
            buttons_layout.addStretch()
            buttons_layout.addWidget(use_btn)
            
            # 添加到布局
            item_layout.addWidget(date_label)
            item_layout.addWidget(latex_text)
            item_layout.addLayout(buttons_layout)
            
            # 添加分割线
            line = QFrame()
            line.setFrameShape(QFrame.HLine)
            line.setFrameShadow(QFrame.Sunken)
            line.setStyleSheet('background-color: #ddd;')
            
            scroll_layout.addWidget(item_widget)
            scroll_layout.addWidget(line)
        
        # 创建滚动区域
        scroll_area = QScrollArea()
        scroll_area.setWidget(scroll)
        scroll_area.setWidgetResizable(True)
        scroll_area.setStyleSheet("""
            QScrollArea {
                border: none;
            }
        """)
        
        # 添加到主布局
        layout.addWidget(scroll_area)
        
        # 添加关闭按钮
        close_btn = QPushButton('关闭')
        close_btn.clicked.connect(self.reject)
        close_btn.setStyleSheet("""
            QPushButton {
                padding: 5px 20px;
            }
        """)
        layout.addWidget(close_btn, alignment=Qt.AlignRight)
        
        # 设置对话框样式
        self.setStyleSheet("""
            QDialog {
                background-color: white;
            }
            * {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
            }
        """)
    
    def use_formula(self):
        """处理带格式的公式使用"""
        action = self.sender()
        latex = action.property('latex')
        mode = action.property('mode')
        
        # 根据模式处理文本
        if mode == 'inline':
            latex = f"${latex}$"
        elif mode == 'display':
            latex = f"$${latex}$$"
            
        self.selected_latex = latex
        self.accept()
    
    def use_formula_default(self, latex):
        """处理默认的公式使用（点击按钮而不是菜单时）"""
        self.selected_latex = latex
        self.accept()

    def clear_history(self):
        """清空历史记录"""
        reply = QMessageBox.question(
            self, 
            '确认', 
            '确定要清空所有历史记录吗？\n此操作不可恢复。',
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            self.parent().history.clear()  # 清空历史记录列表
            self.parent().save_history()   # 保存空的历史记录
            self.accept()  # 关闭对话框

    def delete_item(self):
        """删除单个历史记录"""
        btn = self.sender()
        latex = btn.property('latex')
        
        reply = QMessageBox.question(
            self, 
            '确认', 
            '确定要删除这条记录吗？',
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            # 从历史记录中删除
            self.parent().history = [item for item in self.parent().history if item['latex'] != latex]
            # 保存更新后的历史记录
            self.parent().save_history()
            # 关闭当前对话框
            self.accept()
            # 如果还有历史记录，重新打开对话框
            if self.parent().history:
                self.parent().show_history_dialog()
            else:
                QMessageBox.information(self, '提示', '已删除所有历史记录')

class ShortcutSettingsDialog(QDialog):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.parent = parent
        self.initUI()
        self.setStyleSheet("""
            * {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
            }
            QKeySequenceEdit {
                padding: 5px;
                min-width: 150px;
            }
        """)
        
    def initUI(self):
        self.setWindowTitle('快捷键设置')
        self.setModal(True)
        layout = QFormLayout(self)
        
        # 创建快捷键编辑器
        self.capture_shortcut = QKeySequenceEdit(self)
        self.upload_shortcut = QKeySequenceEdit(self)
        
        # 设置当前值，修改默认快捷键为 Alt+C 和 Alt+V
        settings = QSettings('LaTeXOCR', 'Shortcuts')
        self.capture_shortcut.setKeySequence(settings.value('capture', 'Alt+C'))
        self.upload_shortcut.setKeySequence(settings.value('upload', 'Alt+V'))
        
        # 添加到布局
        layout.addRow('截图快捷键:', self.capture_shortcut)
        layout.addRow('上传图片快捷键:', self.upload_shortcut)
        
        # 添加按钮
        buttons = QDialogButtonBox(
            QDialogButtonBox.Ok | QDialogButtonBox.Cancel,
            Qt.Horizontal, self)
        buttons.accepted.connect(self.accept)
        buttons.rejected.connect(self.reject)
        layout.addRow(buttons)

class ScreenshotWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.overlay = None
        self.history = []
        self.current_image_path = None
        self.load_history()
        self.load_settings()
        self.setup_global_shortcuts()
        self.initUI()
        # 设置全局字体
        self.setStyleSheet("""
            * {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
            }
            QPushButton {
                padding: 5px 10px;
            }
            QLineEdit {
                padding: 3px 5px;
            }
            QTextEdit {
                padding: 5px;
            }
        """)
        
    def initUI(self):
        self.setWindowTitle('公式识别工具')
        self.setGeometry(100, 100, 800, 600)
        
        # 创建菜单栏
        menubar = self.menuBar()
        
        # 添加操作菜单（放在第一位）
        operationMenu = menubar.addMenu('操作')
        
        # 添加截图选项
        captureAction = operationMenu.addAction('截图 (Alt+C)')
        captureAction.triggered.connect(self.start_capture)
        
        # 添加本地上传选项
        uploadAction = operationMenu.addAction('上传图片 (Alt+U)')
        uploadAction.triggered.connect(self.upload_image)
        uploadAction.setShortcut('Alt+U')
        
        # 添加设置菜单
        settingsMenu = menubar.addMenu('设置')
        apiAction = settingsMenu.addAction('API设置')
        apiAction.triggered.connect(self.show_api_settings)
        shortcutAction = settingsMenu.addAction('快捷键设置')
        shortcutAction.triggered.connect(self.show_shortcut_settings)
        
        # 添加历史记录菜单
        historyMenu = menubar.addMenu('历史记录')
        self.update_history_menu(historyMenu)
        
        # 添加关于菜单
        helpMenu = menubar.addMenu('帮助')
        aboutAction = helpMenu.addAction('关于')
        aboutAction.triggered.connect(self.show_about_dialog)
        
        # 创建中心部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout = QVBoxLayout(central_widget)  # 改为垂直布局
        
        # 创建分割器
        splitter = QSplitter(Qt.Vertical)  # 改为垂直分割
        layout.addWidget(splitter)
        
        # 上方图片显示区域
        top_widget = QWidget()
        top_layout = QVBoxLayout(top_widget)
        
        # 图片标签
        image_label = QLabel("识别图片：")
        self.image_display = QLabel()
        self.image_display.setStyleSheet("""
            QLabel {
                border: 1px solid #ccc;
                background-color: white;
                min-width: 400px;
                min-height: 200px;
            }
        """)
        self.image_display.setAlignment(Qt.AlignCenter)
        
        top_layout.addWidget(image_label)
        top_layout.addWidget(self.image_display)
        
        # 下方LaTeX代码区域
        bottom_widget = QWidget()
        bottom_layout = QVBoxLayout(bottom_widget)
        
        latex_label = QLabel("LaTeX代码：")
        self.latex_text = QTextEdit()
        self.latex_text.setReadOnly(False)
        self.latex_text.setMinimumHeight(100)
        self.latex_text.setStyleSheet("""
            QTextEdit {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
                padding: 5px;
                border: 1px solid #ccc;
                border-radius: 3px;
                background-color: white;
            }
            QTextEdit:focus {
                border: 1px solid #1E90FF;
            }
        """)
        
        # 复制按钮布局
        button_layout = QHBoxLayout()
        
        # 创建复制按钮和菜单
        self.copy_btn = QPushButton("复制Latex")
        copy_menu = QMenu(self)
        
        # 添加复制选项
        normal_action = copy_menu.addAction("复制原始代码")
        normal_action.triggered.connect(lambda: self.copy_latex('normal'))
        
        inline_action = copy_menu.addAction("复制为 $...$")
        inline_action.triggered.connect(lambda: self.copy_latex('inline'))
        
        display_action = copy_menu.addAction("复制为 $$...$$")
        display_action.triggered.connect(lambda: self.copy_latex('display'))
        
        # 设置默认动作和菜单
        self.copy_btn.setMenu(copy_menu)
        self.copy_btn.clicked.connect(lambda: self.copy_latex('normal'))  # 点击按钮时的默认动作
        
        button_layout.addStretch()
        button_layout.addWidget(self.copy_btn)
        
        # 添加状态标签
        self.status_label = QLabel()
        self.status_label.setStyleSheet("""
            QLabel {
                color: #666;
                padding: 5px;
            }
        """)
        bottom_layout.addWidget(self.status_label)
        
        bottom_layout.addWidget(latex_label)
        bottom_layout.addWidget(self.latex_text)
        bottom_layout.addLayout(button_layout)
        
        # 添加到分割器
        splitter.addWidget(top_widget)
        splitter.addWidget(bottom_widget)
        
        # 设置分割器初始大小
        splitter.setSizes([300, 300])  # 调整上下区域的初始大小比例
        
        # 设置快捷键
        shortcut = QShortcut(QKeySequence("Alt+C"), self)
        shortcut.activated.connect(self.start_capture)
    
    def copy_latex(self, mode='normal'):
        """
        复制LaTeX代码
        mode: 复制模式
            - normal: 直接复制
            - inline: 添加 $...$ 格式
            - display: 添加 $$...$$ 格式
        """
        text = self.latex_text.toPlainText().strip()
        if not text:
            return
            
        # 根据模式处理文本
        if mode == 'inline':
            text = f"${text}$"
        elif mode == 'display':
            text = f"$${text}$$"
        
        # 复制到剪贴板
        clipboard = QApplication.clipboard()
        clipboard.setText(text)
        
        # 显示复制成功提示
        QToolTip.showText(
            self.copy_btn.mapToGlobal(QPoint(0, 0)),
            "已复制到剪贴板",
            self.copy_btn,
            QRect(),
            1500  # 显示1.5秒
        )

    def start_capture(self):
        self.hide()
        if self.overlay is None:
            self.overlay = OverlayWidget(self)
        self.overlay.showFullScreen()

    def display_image(self, image_path):
        """显示图片"""
        pixmap = QPixmap(image_path)
        if not pixmap.isNull():
            # 保持宽高比例缩放
            scaled_pixmap = pixmap.scaled(
                self.image_display.width(),
                self.image_display.height(),
                Qt.KeepAspectRatio,
                Qt.SmoothTransformation
            )
            self.image_display.setPixmap(scaled_pixmap)

    def recognize_formula(self, image_path):
        # 保存图片路径
        self.current_image_path = image_path
        
        # 显示图片
        self.display_image(image_path)
        
        # 清空之前的结果
        self.latex_text.clear()
        self.status_label.setText("准备识别...")
        
        # 创建并启动识别线程
        self.recognize_thread = RecognizeThread(image_path, SIMPLETEX_APP_ID, SIMPLETEX_APP_SECRET)
        self.recognize_thread.progress.connect(self.update_progress)
        self.recognize_thread.finished.connect(self.handle_recognition_result)
        self.recognize_thread.start()
    
    def update_progress(self, message):
        """更新进度信息"""
        self.status_label.setText(message)
    
    def handle_recognition_result(self, result):
        """处理识别结果"""
        if "error" in result:
            self.latex_text.setText(f"识别出错：{result['error']}")
            self.status_label.setText("识别失败")
            return
            
        if result.get('status') is True:
            latex = result.get('res', {}).get('latex', '')
            if latex:
                self.latex_text.setText(latex)
                self.status_label.setText("识别完成")
                # 添加到历史记录（确保latex不为空）
                if latex.strip():  # 确保不是空字符串
                    self.add_to_history(latex)
            else:
                self.latex_text.setText("识别结果为空")
                self.status_label.setText("识别失败")
        else:
            error_msg = result.get('message', '未知错误')
            self.latex_text.setText(f"识别失败：{error_msg}")
            self.status_label.setText("识别失败")

    def show_api_settings(self):
        dialog = APISettingsDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            global SIMPLETEX_APP_ID, SIMPLETEX_APP_SECRET
            SIMPLETEX_APP_ID = dialog.app_id_input.text()
            SIMPLETEX_APP_SECRET = dialog.app_secret_input.text()
            self.save_settings()
    
    def load_settings(self):
        try:
            if os.path.exists('settings.json'):
                with open('settings.json', 'r') as f:
                    settings = json.load(f)
                    global SIMPLETEX_APP_ID, SIMPLETEX_APP_SECRET
                    SIMPLETEX_APP_ID = settings.get('app_id', SIMPLETEX_APP_ID)
                    SIMPLETEX_APP_SECRET = settings.get('app_secret', SIMPLETEX_APP_SECRET)
        except Exception as e:
            print(f"加载设置失败: {e}")
    
    def save_settings(self):
        try:
            settings = {
                'app_id': SIMPLETEX_APP_ID,
                'app_secret': SIMPLETEX_APP_SECRET
            }
            with open('settings.json', 'w') as f:
                json.dump(settings, f)
        except Exception as e:
            print(f"保存设置失败: {e}")

    def upload_image(self):
        """处理本地图片上传"""
        file_name, _ = QFileDialog.getOpenFileName(
            self,
            "选择图片",
            "",
            "图片文件 (*.png *.jpg *.jpeg *.bmp);;所有文件 (*.*)"
        )
        
        if file_name:
            try:
                # 直接使用选择的图片文件进行识别
                self.recognize_formula(file_name)
            except Exception as e:
                self.result_text.setText(f"图片处理失败：{str(e)}")

    def update_history_menu(self, menu=None):
        """更新历史记录菜单"""
        if menu is None:
            menu = self.menuBar().findChild(QMenu, 'historyMenu')
            if not menu:
                return
        
        menu.clear()
        # 添加"显示历史记录"选项
        show_history_action = menu.addAction('显示历史记录...')
        show_history_action.triggered.connect(self.show_history_dialog)
        
        if self.history:
            menu.addSeparator()
            # 添加最近的历史记录（最多显示5条）
            for item in self.history[:5]:
                latex_preview = item['latex'][:30]
                if len(item['latex']) > 30:
                    latex_preview += "..."
                action = menu.addAction(f"{item['date']} - {latex_preview}")
                action.setToolTip(item['latex'])
                action.setData(item)
                action.triggered.connect(self.load_history_item)
    
    def show_history_dialog(self):
        """显示历史记录对话框"""
        if not self.history:
            QMessageBox.information(self, '提示', '暂无历史记录')
            return
            
        dialog = HistoryDialog(self.history, self)
        if dialog.exec_() == QDialog.Accepted and dialog.selected_latex:
            self.latex_text.setText(dialog.selected_latex)

    def load_history_item(self):
        """加载历史记录项"""
        action = self.sender()
        if action:
            item = action.data()
            self.latex_text.setText(item['latex'])
    
    def add_to_history(self, latex):
        """添加新的历史记录"""
        if not latex or not latex.strip():  # 检查是否为空或只包含空白字符
            return
            
        # 创建新的历史记录项
        new_item = {
            'date': datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'latex': latex.strip()  # 确保去除首尾空白字符
        }
        
        # 检查是否已存在相同的记录
        if any(item['latex'] == new_item['latex'] for item in self.history):
            return
        
        # 添加到历史记录列表
        self.history.insert(0, new_item)
        
        # 保持最多5条记录
        self.history = self.history[:5]
        
        # 保存历史记录
        self.save_history()
        
        # 更新菜单
        history_menu = self.menuBar().findChild(QMenu, 'historyMenu')
        if history_menu:
            self.update_history_menu(history_menu)
    
    def save_history(self):
        """保存历史记录到文件"""
        try:
            with open('history.json', 'w', encoding='utf-8') as f:
                json.dump(self.history, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"保存历史记录失败: {e}")
    
    def load_history(self):
        """从文件加载历史记录"""
        try:
            if os.path.exists('history.json'):
                with open('history.json', 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
        except Exception as e:
            print(f"加载历史记录失败: {e}")
            self.history = []

    def show_about_dialog(self):
        """显示关于对话框"""
        dialog = AboutDialog(self)
        dialog.exec_()

    def closeEvent(self, event):
        """窗口关闭事件处理"""
        try:
            # 取消注册全局快捷键
            keyboard.unhook_all()
            
            # 删除当前临时图片文件
            if self.current_image_path and os.path.exists(self.current_image_path):
                try:
                    os.remove(self.current_image_path)
                except:
                    pass
            
            # 清空历史记录文件
            if os.path.exists('history.json'):
                os.remove('history.json')
            
            # 清空历史记录列表
            self.history.clear()
            
            # 接受关闭事件
            event.accept()
            
        except Exception as e:
            print(f"清理失败: {e}")
            event.accept()

    def setup_global_shortcuts(self):
        """设置全局快捷键"""
        settings = QSettings('LaTeXOCR', 'Shortcuts')
        capture_seq = settings.value('capture', 'Alt+C')
        upload_seq = settings.value('upload', 'Alt+V')
        
        # 注册全局快捷键
        try:
            # 先清除可能存在的旧快捷键
            keyboard.unhook_all()
            
            # 注册新的快捷键，使用 QTimer 确保在主线程中执行
            keyboard.add_hotkey(capture_seq.lower(), lambda: QTimer.singleShot(0, self.safe_start_capture))
            keyboard.add_hotkey(upload_seq.lower(), lambda: QTimer.singleShot(0, self.safe_upload_image))
            
        except Exception as e:
            QMessageBox.warning(self, '警告', f'注册全局快捷键失败: {str(e)}\n请以管理员权限运行程序。')
    
    def safe_start_capture(self):
        """安全的截图启动方法"""
        try:
            if not self.isHidden():
                self.hide()
            if self.overlay is None:
                self.overlay = OverlayWidget(self)
            self.overlay.showFullScreen()
        except Exception as e:
            print(f"截图启动失败: {e}")
    
    def safe_upload_image(self):
        """安全的图片上传方法"""
        try:
            if self.isHidden():
                self.show()
            self.upload_image()
        except Exception as e:
            print(f"图片上传失败: {e}")

    def show_shortcut_settings(self):
        """显示快捷键设置对话框"""
        dialog = ShortcutSettingsDialog(self)
        if dialog.exec_() == QDialog.Accepted:
            # 保存新的快捷键设置
            settings = QSettings('LaTeXOCR', 'Shortcuts')
            settings.setValue('capture', dialog.capture_shortcut.keySequence().toString())
            settings.setValue('upload', dialog.upload_shortcut.keySequence().toString())
            
            # 更新全局快捷键
            self.setup_global_shortcuts()
            
            # 显示提示
            QMessageBox.information(self, '提示', '快捷键设置已更新')

class OverlayWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__()
        self.parent = parent
        self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.Tool)
        self.setStyleSheet("""
            * {
                font-family: "Microsoft YaHei";
                font-size: 10pt;
            }
            QWidget {
                background-color: rgba(0, 0, 0, 100);
            }
            QRubberBand {
                border: 2px solid #1E90FF;
                background-color: rgba(30, 144, 255, 30);
            }
        """)
        self.setAttribute(Qt.WA_TranslucentBackground)
        self.setCursor(Qt.CrossCursor)
        
        self.rubberband = QRubberBand(QRubberBand.Rectangle, self)
        self.origin = None
        self.current_geometry = None
        
        screen = QApplication.primaryScreen().geometry()
        self.setGeometry(screen)
    
    def showEvent(self, event):
        """窗口显示时重置状态"""
        super().showEvent(event)
        self.origin = None
        self.current_geometry = None
        if self.rubberband:
            self.rubberband.hide()
        self.update()
    
    def keyPressEvent(self, event):
        if event.key() == Qt.Key_Escape:
            self.close()
            self.parent.show()
    
    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.origin = event.pos()
            self.rubberband.setGeometry(QRect(self.origin, QSize()))
            self.rubberband.show()
    
    def mouseMoveEvent(self, event):
        if self.origin:
            rect = QRect(self.origin, event.pos()).normalized()
            self.current_geometry = rect
            self.rubberband.setGeometry(rect)
            self.update()
    
    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton and self.rubberband.isVisible():
            self.current_geometry = self.rubberband.geometry()
            if self.current_geometry.width() > 10 and self.current_geometry.height() > 10:
                QTimer.singleShot(100, self.take_screenshot)
            else:
                self.close()
                self.parent.show()
    
    def paintEvent(self, event):
        painter = QPainter(self)
        # 绘制半透明背景
        mask = QColor(0, 0, 0, 100)
        painter.fillRect(self.rect(), mask)
        
        if self.current_geometry:
            # 清除选区的遮罩（使选区透明）
            painter.setCompositionMode(QPainter.CompositionMode_Clear)
            painter.fillRect(self.current_geometry, Qt.transparent)
            
            # 恢复正常绘制模式
            painter.setCompositionMode(QPainter.CompositionMode_SourceOver)
            
            # 绘制选区边框
            painter.setPen(QPen(Qt.white, 2, Qt.SolidLine))
            painter.drawRect(self.current_geometry)
            
            # 绘制选区大小信息
            size_text = f"{self.current_geometry.width()} x {self.current_geometry.height()}"
            painter.drawText(
                self.current_geometry.right() + 5,
                self.current_geometry.top() + 20,
                size_text
            )
    
    def take_screenshot(self):
        temp_file = None
        try:
            # 先关闭截图界面并显示主窗口
            self.close()
            self.parent.show()
            
            # 等待一下确保界面切换完成
            QTimer.singleShot(100, lambda: self._do_screenshot(temp_file))
            
        except Exception as e:
            self.parent.latex_text.setText(f"截图失败：{str(e)}")
            self.close()
            self.parent.show()
    
    def _do_screenshot(self, temp_file):
        try:
            screen = QApplication.primaryScreen()
            screenshot = screen.grabWindow(0, 
                                        self.current_geometry.x(), 
                                        self.current_geometry.y(),
                                        self.current_geometry.width(), 
                                        self.current_geometry.height())
            
            # 创建临时文件
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            temp_file_path = temp_file.name
            temp_file.close()
            
            # 保存截图
            screenshot.save(temp_file_path, 'PNG')
            
            # 显示图片并识别公式
            self.parent.recognize_formula(temp_file_path)
            
        except Exception as e:
            self.parent.latex_text.setText(f"截图失败：{str(e)}")

def main():
    app = QApplication(sys.argv)
    window = ScreenshotWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
