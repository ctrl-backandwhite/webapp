import { Component } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { HasRoleDirective } from './has-role.directive';
import { RoleService } from '../services/role.service';
import { TokenService } from '../services/token.service';

function makeJwt(payload: Record<string, unknown>): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

@Component({
  template: `<div *hasRole="'ROLE_ADMIN'">Admin Content</div>`,
  standalone: true,
  imports: [HasRoleDirective],
})
class TestHostComponent { }

@Component({
  template: `<div *hasRole="['ROLE_ADMIN', 'ROLE_USER']">Multi-Role Content</div>`,
  standalone: true,
  imports: [HasRoleDirective],
})
class TestHostMultiRoleComponent { }

describe('HasRoleDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let roleService: RoleService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [TestHostComponent, TestHostMultiRoleComponent],
      providers: [TokenService, RoleService],
    });
    roleService = TestBed.inject(RoleService);
  });

  afterEach(() => localStorage.clear());

  it('should not render when user lacks the role', () => {
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Admin Content');
  });

  it('should render when user has the role', () => {
    localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_ADMIN'] }));
    roleService.updateRoles();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Admin Content');
  });

  it('should render when user has any of multiple roles', () => {
    localStorage.setItem('access_token', makeJwt({ roles: ['ROLE_USER'] }));
    roleService.updateRoles();

    const multi = TestBed.createComponent(TestHostMultiRoleComponent);
    multi.detectChanges();
    expect(multi.nativeElement.textContent).toContain('Multi-Role Content');
  });
});
