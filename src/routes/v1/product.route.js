const express = require('express');
const productController = require('../../controllers/product.controller');
const upload = require('../../middlewares/upload');
const stockImage = require('../../middlewares/stock');
const bill = require('../../middlewares/bills');
const router = express.Router();
const productservice = require('../../services/product.service');
router
  .route('/create')
  .post(
    upload.fields([{ name: 'image' }, { name: 'galleryImages' }]),
    productservice.doplicte_check,
    productController.createProduct
  );
router.route('/').get(productController.getProducts);
router
  .route('/:productId')
  .get(productController.getproduct)
  .delete(productController.deleteProduct)
  .put(upload.fields([{ name: 'image' }, { name: 'galleryImages' }]), productController.updateProduct);
router.route('/setTrendsValue/:id').put(productController.setTrendsValueforProduct);
router.route('/getProduct/products/:id').get(productController.getProductByIdWithAggregation);
router.route('/shopProducts/getName').get(productController.productAggregationWithShopOrder);
router.route('/stocks').post(stockImage.array('weighbridgeBill'), productController.createStock);
router.route('/stocks/update/vehicles/:id').put(stockImage.array('weighbridgeBill'), productController.updatesStockById);
router.route('/shopList').post(productController.createShopListService);
router.route('/shopList/all').get(productController.getShopList);
// router.route('/closeorder').post(productController.getbillingexecutive);
router.route('/stocks/update/:stockId').put(productController.updateStockById);
router.route('/stock/all').get(productController.getAllStock);
router.route('/suppliers/:supplierId').get(productController.getStockBySupplierId);
router.route('/confirmStock').post(productController.createConfirmStock);
router.route('/confirmStock/all').get(productController.getAllConfirmStock);
router.route('/stock/:id').put(productController.updateStockStatusById);
router.route('/stock/bills/:billId').get(productController.getStockbyBillId);
router.route('/updateStock/:stockId').put(productController.updateStockById);
router.route('/stock/created').get(productController.getStockByStatusCreated);
router.route('/stock/raised').get(productController.getStockByStatusRaised);
router.route('/stock/delivered').get(productController.getStocksByStatusDelivered);
router.route('/stock/closed').get(productController.getStockByStatusClosed);
router.route('/sendData/:id').put(bill.array('weighbridgeBill'), productController.sendStocktoLoadingExecute);
// router.route('/stock/delivered').get(productController.getStocksByStatusDelivered);
router.route('/stock/loadingExecute').get(productController.getStockByLoadingExecute);
router.route('/updateQty/:id').put(productController.updateStockQtyById);
router.route('/loadingExecute/all').get(productController.getLoadingExecuteDate);
router.route('/allience/:id').get(productController.getAllienceBySupplierId);
router.route('/getall/product/aggregateById/:page').get(productController.productaggregateById);
router.route('/removeimage/:id/:index').get(productController.removeImage);
router
  .route('/confirmStock/:confirmStockId')
  .get(productController.getconfirmStockById)
  .put(productController.updateConfirmStock)
  .delete(productController.deleteConfirmStockById);
router.route('/arrived/:id').put(productController.updateArrivedById);

router.route('/mwloadingExecute').post(productController.createMainWherehouseLoadingExecute);
router.route('/mwloadingExecute/all').get(productController.getAllMailWherehoustLoadingExecute);
router
  .route('/mwloadingExecutes/:mwLoadingId')
  .get(productController.getMailWherehoustLoadingExecuteById)
  .put(productController.updateMainWherehouseLoadingExecuteById)
  .delete(productController.deleteMainWherehouseLoadingExecuteById);

router.route('/billRaise').post(productController.createBillRaise);
router.route('/billRaise/All').get(productController.getAllBillRaised);
router
  .route('/billRaise/:billRaiseId')
  .get(productController.getBillRaiseById)
  .put(productController.updateBillRaiseById)
  .delete(productController.deleteConfirmStockById);

router.route('/manageBill').post(productController.createManageBill);
router.route('/managebill/all').get(productController.getAllManageBill);
router
  .route('/manageBill/:manageBillId')
  .get(productController.getManageBillById)
  .put(productController.updateManageBill)
  .delete(productController.deleteBillManage);
router.route('/updateDelivered/:id').put(productController.updatingStatusForDelivered);
router.route('/pagination/product/:id').get(productController.productPaginationForTrends);
router.route('/product/filter/:date').get(productController.productDateTimeFilter);
router.route('/prod/:id/:date').get(productController.aggregationWithProductId);
router.route('/dealProduct/supplier/:id').get(productController.productDealingWithsupplier);
router.route('/getAll/Trends/:wardId/:street/:page').get(productController.getAllTrends);
router.route('/trendsCounts/:productId/:date/:wardId/:street').get(productController.gettrendsCount);

// cost price calculation

router.route('/costPrice/calculation/:date/:page').get(productController.costPriceCalculation);
router.route('/AccountsDetails/:date/:page').get(productController.AccountDetails);

// rateSetSellingPrice

router.route('/rateSetSellingPrice/consolidate/:productId').get(productController.rateSetSellingPrice);
router.route('/product/existCheck/filter/:key').get(productController.productaggregateFilter);

// stock segregation flow

router.route('/stock/segregation/:date/:page').get(productController.incommingStockQty);
router.route('/stock/Assgin/:date/:page').get(productController.AssignStockGetall);
router.route('/getsetsales/dataOnly/:page').get(productController.getDataOnlySetSales);
router.route('/setprice/details/:page').get(productController.get_Set_price_product);
router.route('/getproduct/stock/:type').get(productController.get_random_product);
router.route('/get/product/by/category/:id').get(productController.getProductbycategory);
router.route('/getDataby/Categories/:value').get(productController.getDatabyCategories);
module.exports = router;
