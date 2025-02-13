import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import SummaryPage from '../components/Inventory/SummaryPage';


const Tables = () => {
  return (
    <>
      <Breadcrumb pageName="Inventory/Summary" />
      <div className="flex flex-col gap-10">
        <SummaryPage />
        
      </div>
    </>
  );
};

export default Tables;
