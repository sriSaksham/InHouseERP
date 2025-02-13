import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Inventory from '../components/Inventory/AddQuantity';


const Tables = () => {
  return (
    <>
      <Breadcrumb pageName="Inventory" />
      <div className="flex flex-col gap-10">
        <Inventory />
        
      </div>
    </>
  );
};

export default Tables;
