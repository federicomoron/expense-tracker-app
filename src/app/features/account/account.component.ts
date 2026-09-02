import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { AuthService } from '@services/auth.service';
import { GroupService } from '@services/group.service';
import { I18nService } from '@services/i18n.service';
import { PwaInstallService } from '@services/pwa-install.service';
import { UiMessageService } from '@services/ui-message.service';
import { PwaInstallButtonComponent } from '@shared/components/pwa-install-button/pwa-install-button.component';
import { SharedMaterialModule } from '@shared/shared-material.module';
import { ThemeToggleComponent } from '@shared/ui/theme-toggle/theme-toggle.component';

interface ClaimableGuest {
  userId: number;
  name: string;
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    CommonModule,
    SharedMaterialModule,
    ThemeToggleComponent,
    PwaInstallButtonComponent,
    TranslateModule,
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly claimableGuests = signal<ClaimableGuest[]>([]);
  readonly claimingUserId = signal<number | null>(null);

  private readonly pwa = inject(PwaInstallService);
  private readonly i18n = inject(I18nService);
  private readonly groupService = inject(GroupService);
  private readonly uiMessage = inject(UiMessageService);

  get currentLang(): string {
    return this.i18n.currentLang;
  }

  ngOnInit(): void {
    this.loadClaimableGuests();
  }

  logout(): void {
    this.auth.logout();
  }

  toggleLang(): void {
    const newLang = this.i18n.currentLang === 'en' ? 'es' : 'en';
    void this.i18n.setLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  }

  installPWA(): void {
    this.pwa.install();
  }

  claimGuest(guestUserId: number): void {
    if (this.claimingUserId()) return;
    this.claimingUserId.set(guestUserId);

    this.auth.claimGuestMembership(guestUserId).subscribe({
      next: (res) => {
        this.claimingUserId.set(null);
        if (res.success) {
          this.claimableGuests.update((guests) => guests.filter((g) => g.userId !== guestUserId));
          this.groupService.fetchGroups().subscribe();
          this.uiMessage.showSuccess('account.guestClaimed');
        } else {
          this.uiMessage.showError('account.errorClaimingGuest');
        }
      },
      error: () => {
        this.claimingUserId.set(null);
        this.uiMessage.showError('account.errorClaimingGuest');
      },
    });
  }

  private loadClaimableGuests(): void {
    this.auth.getClaimableGuests().subscribe({
      next: (res) => {
        if (res.success) this.claimableGuests.set(res.data);
      },
      error: () => {
        this.claimableGuests.set([]);
      },
    });
  }
}
