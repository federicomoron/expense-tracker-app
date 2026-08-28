import { ApiStatusService } from '@services/api-status.service';
import { PendingExpensesService } from '@services/pending-expenses.service';

export function connectivityInitializer(
  apiStatus: ApiStatusService,
  pendingExpenses: PendingExpensesService,
): () => void {
  return () => {
    apiStatus.setReachable(navigator.onLine);

    if (navigator.onLine) {
      pendingExpenses.syncAll();
    }

    window.addEventListener('online', () => {
      apiStatus.setReachable(true);
      pendingExpenses.syncAll();
    });

    window.addEventListener('offline', () => {
      apiStatus.setReachable(false);
    });
  };
}
