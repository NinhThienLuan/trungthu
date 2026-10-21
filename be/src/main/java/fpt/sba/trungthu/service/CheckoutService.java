package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CheckoutRequest;
import fpt.sba.trungthu.dto.response.CheckoutPreviewResponse;
import fpt.sba.trungthu.dto.response.OrderDetailResponse;

import java.util.List;

public interface CheckoutService {
    CheckoutPreviewResponse preview(CheckoutRequest request);
    List<OrderDetailResponse> checkout(CheckoutRequest request);
}
