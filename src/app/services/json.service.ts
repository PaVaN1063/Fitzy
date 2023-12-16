import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor(private http: HttpClient) { }
  
getBoxData(): Observable<any>{
  return this.http.get('../../assets/Json Files/date.json');
}

getUsers() : Observable<any>{
  return this.http.get('../../assets/Json Files/users.json');
}

getMonths() : Observable<any>{
  return this.http.get('../../assets/Json Files/months.json');
}

getDates() : Observable<any>{
  return this.http.get('../../assets/Json Files/date.json');
}
}
