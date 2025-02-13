import React from 'react';
import { useSite } from './SiteContext';

interface PageWithSiteIdProps {
  children: React.ReactNode; // The child components to render
}

const PageWithSiteId: React.FC<PageWithSiteIdProps> = ({ children }) => {
  const { siteId } = useSite();

  if (!siteId) {
    // Render a message or redirect if no siteId is selected
    return <div>Please select a site to proceed.</div>;
  }

  return <>{children}</>;
};

export default PageWithSiteId;
