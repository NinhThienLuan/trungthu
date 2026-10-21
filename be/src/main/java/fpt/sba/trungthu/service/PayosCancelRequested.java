package fpt.sba.trungthu.service;

import java.util.UUID;

public record PayosCancelRequested(UUID providerId, long payosOrderCode) {}
