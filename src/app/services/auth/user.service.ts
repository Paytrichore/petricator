import { Observable } from "rxjs";
import { User } from "../../core/stores/user/user.model";
import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private userApiUrl = environment.userApiUrl;

  public updateUser(userId: string, updates: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.userApiUrl}/users/${userId}`, updates);
  }
}