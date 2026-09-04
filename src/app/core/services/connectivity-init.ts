import { ApiStatusService } from '@services/api-status.service';
import { PendingExpensesService } from '@services/pending-expenses.service';
import { PendingPaymentsService } from '@services/pending-payments.service';

export function connectivityInitializer(
  apiStatus: ApiStatusService,
  pendingExpenses: PendingExpensesService,
  pendingPayments: PendingPaymentsService,
): () => void {
  return () => {
    apiStatus.setReachable(navigator.onLine);

    if (navigator.onLine) {
      pendingExpenses.syncAll();
      pendingPayments.syncAll();
    }

    window.addEventListener('online', () => {
      apiStatus.setReachable(true);
      pendingExpenses.syncAll();
      pendingPayments.syncAll();
    });

    window.addEventListener('offline', () => {
      apiStatus.setReachable(false);
    });
  };
}
