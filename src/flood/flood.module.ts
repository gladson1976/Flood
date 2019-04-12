import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgbModule, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { FloodComponent } from './flood.component';
import { WindowRef } from './windowref.service';

@NgModule({
  declarations: [
    FloodComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgbModule.forRoot()
  ],
  providers: [WindowRef],
  bootstrap: [FloodComponent]
})
export class FloodModule { }
