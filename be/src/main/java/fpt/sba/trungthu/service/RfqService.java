package fpt.sba.trungthu.service;

import fpt.sba.trungthu.dto.request.CreateRfqRequest;
import fpt.sba.trungthu.dto.request.SubmitQuoteRequest;
import fpt.sba.trungthu.dto.response.QuoteResponse;
import fpt.sba.trungthu.dto.response.RfqResponse;

import java.util.List;
import java.util.UUID;

public interface RfqService {
    RfqResponse create(CreateRfqRequest input);
    List<RfqResponse> mine();
    List<RfqResponse> providerFeed();
    List<QuoteResponse> providerQuotes();
    QuoteResponse submitQuote(UUID requestId, SubmitQuoteRequest input);
    List<QuoteResponse> quotes(UUID requestId);
    QuoteResponse acceptQuote(UUID requestId, UUID quoteId);
}
