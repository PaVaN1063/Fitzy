import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor(private http: HttpClient) { }
  
getData(): Observable<any>{
  return this.http.get('../../assets/Json Files/date.json');
}

getUsers(){
  return this.http.get('../../assers/Json Files/users.json');
}

getMonths(){
  return this.http.get('../../assers/Json Files/months.json');
}
}
