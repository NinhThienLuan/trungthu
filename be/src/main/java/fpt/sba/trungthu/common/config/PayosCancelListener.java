package fpt.sba.trungthu.common.config;

import fpt.sba.trungthu.service.PayosCancelRequested;
import fpt.sba.trungthu.service.PayosGateway;
import fpt.sba.trungthu.service.impl.ProviderPayosAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class PayosCancelListener {
    private final PayosGateway gateway;
    private final ProviderPayosAccountService accounts;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void cancel(PayosCancelRequested event) {
        try {
            gateway.cancel(accounts.forProvider(event.providerId()), event.payosOrderCode());
        } catch (RuntimeException ex) {
            log.error("Cannot cancel payOS link for code {}; reconcile this payment link",
                    event.payosOrderCode(), ex);
        }
    }
}
