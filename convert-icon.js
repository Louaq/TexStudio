const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

async function generateIcons() {
  try {
    console.log('开始生成图标...');
    
    // 确保SVG文件存在
    const svgPath = path.join(__dirname, 'assets/icon.svg');
    if (!fs.existsSync(svgPath)) {
      console.error('错误: SVG文件不存在:', svgPath);
      return;
    }
    
    // 读取SVG文件
    const svgBuffer = fs.readFileSync(svgPath);
    console.log('成功读取SVG文件');
    
    // 创建不同大小的PNG图像
    const sizes = [16, 32, 48, 64, 128, 256, 512];
    
    // 确保目录存在
    if (!fs.existsSync(path.join(__dirname, 'assets'))) {
      fs.mkdirSync(path.join(__dirname, 'assets'));
    }
    
    if (!fs.existsSync(path.join(__dirname, 'public/icons'))) {
      fs.mkdirSync(path.join(__dirname, 'public/icons'), { recursive: true });
    }
    
    // 生成各种尺寸的PNG
    for (const size of sizes) {
      try {
        console.log(`生成 ${size}x${size} 图标...`);
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(path.join(__dirname, `assets/icon-${size}.png`));
        
        // 同时在public目录也生成一份
        await sharp(svgBuffer)
          .resize(size, size)
          .png()
          .toFile(path.join(__dirname, `public/icons/icon-${size}.png`));
      } catch (err) {
        console.error(`生成 ${size}x${size} 图标时出错:`, err);
      }
    }
    
    // 生成主图标文件
    try {
      console.log('生成主图标文件...');
      await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(path.join(__dirname, 'assets/icon.png'));
    } catch (err) {
      console.error('生成主图标文件时出错:', err);
    }
    
    // 生成PWA所需的图标
    try {
      console.log('生成PWA图标...');
      await sharp(svgBuffer)
        .resize(192, 192)
        .png()
        .toFile(path.join(__dirname, 'public/logo192.png'));
      
      await sharp(svgBuffer)
        .resize(512, 512)
        .png()
        .toFile(path.join(__dirname, 'public/logo512.png'));
    } catch (err) {
      console.error('生成PWA图标时出错:', err);
    }
    
    console.log('所有PNG图标生成完成!');
    
    // 生成favicon
    try {
      console.log('生成favicon...');
      // 生成16x16的favicon作为默认图标
      await sharp(svgBuffer)
        .resize(16, 16)
        .png()
        .toFile(path.join(__dirname, 'public/favicon.ico'));
      console.log('Favicon生成完成');
    } catch (err) {
      console.error('生成favicon时出错:', err);
    }
    
    console.log('图标生成完成!');
  } catch (error) {
    console.error('生成图标时出错:', error);
  }
}

generateIcons().then(() => {
  console.log('脚本执行完成');
}).catch(err => {
  console.error('脚本执行失败:', err);
}); 