import { Injectable, inject } from '@angular/core';
import { driver, type Driver } from 'driver.js';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private readonly translate = inject(TranslateService);
  private tour: Driver | null = null;

  startAdminTour(): void {
    const sectionKey = this.getSectionKey();
    const steps = [
      {
        element: '[data-tour="sidebar"]',
        popover: {
          title: this.translate.instant('tour.sidebar.title'),
          description: this.translate.instant('tour.sidebar.description')
        }
      },
      {
        element: '[data-tour="breadcrumbs"]',
        popover: {
          title: this.translate.instant('tour.breadcrumbs.title'),
          description: this.translate.instant('tour.breadcrumbs.description')
        }
      },
      {
        element: '[data-tour="table"]',
        popover: {
          title: this.translate.instant('tour.table.title'),
          description: this.translate.instant('tour.table.description')
        }
      },
      ...this.getCrudSteps(sectionKey)
    ];

    const filteredSteps = steps.filter((step) => {
      if (!step.element) {
        return true;
      }

      if (typeof step.element === 'string') {
        return Boolean(document.querySelector(step.element));
      }

      return Boolean(step.element);
    });

    this.tour = driver({
      showProgress: true,
      nextBtnText: this.translate.instant('tour.next'),
      prevBtnText: this.translate.instant('tour.prev'),
      doneBtnText: this.translate.instant('tour.done'),
      steps: filteredSteps
    });

    this.tour.drive();
  }

  private getSectionKey(): 'roles' | 'users' | 'groups' | 'scopes' | null {
    const path = window.location.pathname;

    if (path.includes('/admin/roles')) {
      return 'roles';
    }

    if (path.includes('/admin/users')) {
      return 'users';
    }

    if (path.includes('/admin/groups')) {
      return 'groups';
    }

    if (path.includes('/admin/scopes')) {
      return 'scopes';
    }

    return null;
  }

  private getCrudSteps(sectionKey: 'roles' | 'users' | 'groups' | 'scopes' | null) {
    if (!sectionKey) {
      return [];
    }

    const prefix = `tour.${sectionKey}`;

    return [
      {
        element: '[data-tour="tour-create"]',
        popover: {
          title: this.translate.instant(`${prefix}.createTitle`),
          description: this.translate.instant(`${prefix}.createDescription`)
        }
      },
      {
        element: '[data-tour="tour-action-detail"]',
        popover: {
          title: this.translate.instant(`${prefix}.detailTitle`),
          description: this.translate.instant(`${prefix}.detailDescription`)
        }
      },
      {
        element: '[data-tour="tour-action-edit"]',
        popover: {
          title: this.translate.instant(`${prefix}.editTitle`),
          description: this.translate.instant(`${prefix}.editDescription`)
        }
      },
      {
        element: '[data-tour="tour-action-delete"]',
        popover: {
          title: this.translate.instant(`${prefix}.deleteTitle`),
          description: this.translate.instant(`${prefix}.deleteDescription`)
        }
      }
    ];
  }
}
