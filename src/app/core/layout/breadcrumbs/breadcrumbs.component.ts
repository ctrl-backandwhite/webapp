import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumbs',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private routerSub?: Subscription;
  private langSub?: Subscription;

  crumbs = signal<BreadcrumbItem[]>([]);

  ngOnInit() {
    this.crumbs.set(this.buildBreadcrumbs(this.activatedRoute));
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.crumbs.set(this.buildBreadcrumbs(this.activatedRoute)));
    this.langSub = this.translate.onLangChange
      .subscribe(() => this.crumbs.set(this.buildBreadcrumbs(this.activatedRoute)));
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.langSub?.unsubscribe();
  }

  private buildBreadcrumbs(route: ActivatedRoute, url = '', crumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children = route.children;
    if (children.length === 0) {
      return crumbs;
    }

    for (const child of children) {
      const routeUrl = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeUrl) {
        url = `${url}/${routeUrl}`;
      }

      const labelKey = child.snapshot.data?.['breadcrumb'] as string | undefined;
      if (labelKey) {
        const translated = this.translate.instant(labelKey).toLowerCase();
        crumbs.push({ label: translated, url: url || '/' });
      }

      return this.buildBreadcrumbs(child, url, crumbs);
    }

    return crumbs;
  }
}
