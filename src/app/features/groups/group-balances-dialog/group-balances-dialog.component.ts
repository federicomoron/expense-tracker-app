import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import {
  SettleUpDialogComponent,
  SettleUpPreset,
} from '@features/groups/settle-up-dialog/settle-up-dialog.component';
import { GroupMember, GroupMemberBalance } from '@models/group-detail.model';
import { AuthService } from '@services/auth.service';
import { DialogService } from '@services/dialog.service';
import { HeaderComponent } from '@shared/components/header/header.component';
import { CurrencySymbolPipe } from '@shared/pipes/currency-symbol.pipe';
import { SharedMaterialModule } from '@shared/shared-material.module';

export interface GroupBalancesDialogData {
  groupId: number;
  members: GroupMember[];
  memberBalances: GroupMemberBalance[];
  balanceSummary: { currency: string; amount: number }[];
}

@Component({
  selector: 'app-group-balances-dialog',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    TranslateModule,
    HeaderComponent,
    CurrencySymbolPipe,
  ],
  templateUrl: './group-balances-dialog.component.html',
  styleUrls: ['./group-balances-dialog.component.scss'],
})
export class GroupBalancesDialogComponent {
  public readonly dialogRef = inject(MatDialogRef<GroupBalancesDialogComponent>);
  public readonly data = inject(MAT_DIALOG_DATA) as GroupBalancesDialogData;

  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);

  close(): void {
    this.dialogRef.close();
  }

  settleDebt(mb: GroupMemberBalance): void {
    this.openSettleUpDialog(this.buildPreset(mb));
  }

  registerPayment(): void {
    this.openSettleUpDialog();
  }

  private buildPreset(mb: GroupMemberBalance): SettleUpPreset | undefined {
    const currentUserId = this.authService.currentUser()?.id;
    if (!currentUserId) return undefined;

    return mb.amount > 0
      ? { fromUserId: mb.userId, toUserId: currentUserId, amount: mb.amount, currency: mb.currency }
      : {
          fromUserId: currentUserId,
          toUserId: mb.userId,
          amount: -mb.amount,
          currency: mb.currency,
        };
  }

  private openSettleUpDialog(preset?: SettleUpPreset): void {
    const dialogRef = this.dialogService.openFullScreen(SettleUpDialogComponent, {
      groupId: this.data.groupId,
      members: this.data.members,
      preset,
    });

    dialogRef.afterClosed().subscribe((result: { created?: boolean } | undefined) => {
      if (result?.created) this.dialogRef.close({ created: true });
    });
  }
}
