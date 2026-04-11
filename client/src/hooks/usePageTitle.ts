import { useEffect } from 'react';

const usePageTitle = (title: string) => {
  useEffect(() => {
    const defaultTitle = 'RADIX';
    document.title = title ? `${title} | ${defaultTitle}` : `${defaultTitle} | AI-Powered API Monitoring`;
  }, [title]);
};

export default usePageTitle;
