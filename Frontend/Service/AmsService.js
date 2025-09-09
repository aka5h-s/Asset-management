import { getRequest, postRequest, putRequest, deleteRequest } from './Services.js';

// Centralized API service: all backend endpoints with consistent error handling
class AmsService {
  // Authentication endpoints
  login(payload) {
    return postRequest('/auth/authenticate', payload);
  }

  register(payload) {
    return postRequest('/auth/register', payload);
  }

  // Employee endpoints
  getAllEmployees() {
    return getRequest('/employees/getAllEmployee');
  }

  getEmployeeById(employeeId) {
    return getRequest(`/employees/getEmployeeById/${employeeId}`);
  }

  registerEmployee(payload) {
    return postRequest('/employees/register', payload);
  }

  updateEmployee(employeeId, payload) {
    return putRequest(`/employees/updateEmployee/${employeeId}`, payload);
  }

  deleteEmployee(employeeId) {
    return deleteRequest(`/employees/delete/${employeeId}`);
  }

  // Asset Category endpoints
  getAllAssetCategories() {
    return getRequest('/asset-categories/getall');
  }

  getAssetCategoryById(categoryId) {
    return getRequest(`/asset-categories/getbyid/${categoryId}`);
  }

  getAssetCategoryByName(categoryName) {
    return getRequest(`/asset-categories/getbyname/${categoryName}`);
  }

  addAssetCategory(payload) {
    return postRequest('/asset-categories/add', payload);
  }

  updateAssetCategory(categoryId, payload) {
    return putRequest(`/asset-categories/update/${categoryId}`, payload);
  }

  deleteAssetCategory(categoryId) {
    return deleteRequest(`/asset-categories/delete/${categoryId}`);
  }

  // Asset endpoints
  getAllAssets() {
    return getRequest('/assets/getall');
  }

  getAssetById(assetId) {
    return getRequest(`/assets/getbyid/${assetId}`);
  }

  getAssetsByCategory(categoryName) {
    return getRequest(`/assets/category/${categoryName}`);
  }

  getAssetsByEmployee(employeeId) {
    return getRequest(`/assets/assigned/${employeeId}`);
  }

  addAsset(payload) {
    return postRequest('/assets/add', payload);
  }

  updateAsset(assetId, payload) {
    return putRequest(`/assets/update/${assetId}`, payload);
  }

  deleteAsset(assetId) {
    return deleteRequest(`/assets/delete/${assetId}`);
  }

  // Borrowing endpoints
  getBorrowingsByEmployee(employeeId) {
    return getRequest(`/borrowings/getbyeid/${employeeId}`);
  }

  getActiveBorrowings() {
    return getRequest('/borrowings/active');
  }

  getPendingBorrowings() {
    return getRequest('/borrowings/pending');
  }

  getRejectedBorrowings() {
    return getRequest('/borrowings/rejected');
  }

  getReturnedBorrowings() {
    return getRequest('/borrowings/returned');
  }


  requestBorrowing(payload) {
    return postRequest('/borrowings/request', payload);
  }

  updateBorrowingAction(borrowingId, payload) {
    return putRequest(`/borrowings/${borrowingId}/action`, payload);
  }

  returnBorrowing(borrowingId) {
    return putRequest(`/borrowings/${borrowingId}/return`);
  }

  // Service Request endpoints
  getAllServiceRequests() {
    return getRequest('/service-requests/allServiceRequests');
  }

  getServiceRequestById(serviceRequestId) {
    return getRequest(`/service-requests/getServiceRequestById/${serviceRequestId}`);
  }

  getServiceRequestsByEmployee(employeeId) {
    return getRequest(`/service-requests/serviceRequestByEmployee/${employeeId}`);
  }

  getServiceRequestsByStatus(status) {
    return getRequest(`/service-requests/findByStatus/${status}`);
  }

  createServiceRequest(payload) {
    return postRequest('/service-requests/createServiceRequest', payload);
  }

  updateServiceRequest(serviceRequestId, status) {
    return putRequest(`/service-requests/updateServiceRequest/${serviceRequestId}/${status}`);
  }

  // Audit endpoints
  getAllAudits() {
    return getRequest('/audits/getall');
  }

  getAuditsByEmployee(employeeId) {
    return getRequest(`/audits/getbyeid/${employeeId}`);
  }

  getAuditById(auditId) {
    return getRequest(`/audits/getbyid/${auditId}`);
  }

  sendAudit(employeeId, assetId) {
    return postRequest(`/audits/send/${employeeId}/${assetId}`);
  }

  updateAuditDecision(auditId, payload) {
    return putRequest(`/audits/${auditId}/decision`, payload);
  }
}

export default new AmsService();
