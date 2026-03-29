import React from 'react';
import styled from 'styled-components';
import ImageDisplay from '../components/ImageDisplay';
import LatexEditor from '../components/LatexEditor';
import FormulaPreview from '../components/FormulaPreview';
import { ApiConfig } from '../types';

const HomeContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  background: var(--color-surface);
`;

const PageHeader = styled.div`
  padding: 0 24px;
  height: 48px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--color-borderLight);
  flex-shrink: 0;
  background: var(--color-surface);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.1px;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 14px 14px 10px 14px;
  gap: 12px;
  overflow: hidden;
`;

const TopSection = styled.div`
  flex: 1;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex: 1;
  min-height: 160px;
  overflow: hidden;
`;

const PanelCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-radius: 12px;
  padding: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03);
  border: 1px solid var(--color-borderLight);
`;

interface HomeViewProps {
  currentImage: string | null;
  latexCode: string;
  isRecognizing: boolean;
  isDragActive: boolean;
  apiConfig?: ApiConfig;
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
  onUpload,
  onLatexChange,
  getRootProps
}) => {
  return (
    <HomeContainer>
      <ContentArea {...getRootProps()}>
      <TopSection>
        <PanelCard>
          <ImageDisplay
            imageUrl={currentImage}
            isDragActive={isDragActive}
            isRecognizing={isRecognizing}
            onUpload={onUpload}
          />
        </PanelCard>
      </TopSection>
      <BottomSection>
        <PanelCard>
          <LatexEditor
            value={latexCode}
            onChange={onLatexChange}
            readOnly={isRecognizing}
          />
        </PanelCard>
        <PanelCard>
          <FormulaPreview
            latex={latexCode}
            isLoading={isRecognizing}
          />
        </PanelCard>
      </BottomSection>
      </ContentArea>
    </HomeContainer>
  );
};

export default HomeView;
