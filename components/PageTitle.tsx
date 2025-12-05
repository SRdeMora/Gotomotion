import { useEffect } from 'react';

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  useEffect(() => {
    document.title = `${title} - Go2Motion Awards`;
    return () => {
      document.title = 'Go2Motion Awards';
    };
  }, [title]);

  return null;
};

export default PageTitle;

