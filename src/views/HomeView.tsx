import React from 'react';
import styled from 'styled-components';
import ImageDisplay from '../components/ImageDisplay';
import LatexEditor from '../components/LatexEditor';
import FormulaPreview from '../components/FormulaPreview';
import { ApiConfig } from '../types';
import { glassCard, glassPageHeader, glassViewRoot } from '../theme/themes';

const HomeContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  ${glassViewRoot}
`;

const PageHeader = styled.div`
  padding: 0 24px;
  height: 48px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  ${glassPageHeader}
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 16px;
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
  border-radius: 12px;
  padding: 12px;
  overflow: hidden;
  ${glassCard}
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
