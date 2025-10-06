import React from 'react';
import styled from 'styled-components';
import ImageDisplay from '../components/ImageDisplay';
import LatexEditor from '../components/LatexEditor';
import FormulaPreview from '../components/FormulaPreview';
import FormulaExplanation from '../components/FormulaExplanation';
import { ApiConfig } from '../types';

const HomeContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  padding-bottom: 8px;
  gap: 16px;
  overflow: hidden;
  height: 100%;
  background-color: var(--color-surfaceLight);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const TopSection = styled.div`
  flex: 1;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  padding: 2px;
  background-color: var(--color-surface);
  border-radius: 8px;
  
  @media (min-height: 768px) {
    flex: 1.5;
  }
  
  @media (min-height: 900px) {
    flex: 2;
  }
  
  @media (min-height: 1080px) {
    flex: 2.5;
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 540px;
  max-height: 600px;
  height: auto;
  z-index: 1;
  background-color: var(--color-surface);
  border-radius: 8px;
  padding: 15px 15px 15px 15px;
`;

const PreviewAndEditorContainer = styled.div`
  display: flex;
  gap: 12px;
  height: 245px;
  margin-bottom: 22px;

  @media (max-width: 1024px) {
    flex-direction: column;
    height: auto;
    gap: 8px;
  }
`;

const EditorWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 240px;
  overflow: visible;
  position: relative;
  padding-bottom: 2px;
`;

const PreviewWrapper = styled.div`
  flex: 1;
  min-width: 0;
  height: 240px;
  overflow: visible;
  position: relative;
  padding-bottom: 2px;
`;

const ExplanationSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 180px;
  background-color: var(--color-surfaceLight);
  border-radius: 8px;
  padding: 8px;
  border: 2px solid var(--color-borderLight);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-top: 5px;
  
  @media (min-height: 900px) {
    height: 190px;
  }
  
  @media (min-height: 1080px) {
    height: 200px;
  }
`;

interface HomeViewProps {
  currentImage: string | null;
  latexCode: string;
  isRecognizing: boolean;
  isDragActive: boolean;
  apiConfig?: ApiConfig;
  explanationResetKey: number;
  onUpload: () => void;
  onLatexChange: (code: string) => void;
  getRootProps: any;
}

const HomeView: React.FC<HomeViewProps> = ({
  currentImage,
  latexCode,
  isRecognizing,
  isDragActive,
  apiConfig,
  explanationResetKey,
  onUpload,
  onLatexChange,
  getRootProps
}) => {
  return (
    <HomeContainer {...getRootProps()}>
      <TopSection>
        <ImageDisplay
          imageUrl={currentImage}
          isDragActive={isDragActive}
          isRecognizing={isRecognizing}
          onUpload={onUpload}
        />
      </TopSection>
      <BottomSection>
        <PreviewAndEditorContainer>
          <EditorWrapper>
            <LatexEditor
              value={latexCode}
              onChange={onLatexChange}
              readOnly={isRecognizing}
            />
          </EditorWrapper>
          <PreviewWrapper>
            <FormulaPreview
              latex={latexCode}
              isLoading={isRecognizing}
            />
          </PreviewWrapper>
        </PreviewAndEditorContainer>
        
        <ExplanationSection>
          <FormulaExplanation
            latex={latexCode}
            deepSeekConfig={apiConfig?.deepSeek}
            resetKey={explanationResetKey}
          />
        </ExplanationSection>
      </BottomSection>
    </HomeContainer>
  );
};

export default HomeView;
