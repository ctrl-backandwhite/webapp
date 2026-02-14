import { Injectable } from '@angular/core';
import { ApiService } from '../../../core/api/api.service';
import { OAuthClient, OAuthClientInput } from '../interfaces/oauth-client.model';

@Injectable({ providedIn: 'root' })
export class OauthClientsService extends ApiService<OAuthClient, OAuthClientInput> {
    protected resource = 'oauthclients';
}
