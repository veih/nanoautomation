import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { HomeComponent } from "./pages/home/home.component";
import { BrowserModule, provideClientHydration } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule, DATE_PIPE_DEFAULT_OPTIONS } from "@angular/common";
import { XlsxToJsonComponent } from "./components/xlsx-to-json/xlsx-to-json.component";

@NgModule({
  declarations: [
    AppComponent,
    // Pages
    HomeComponent,
    XlsxToJsonComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgModule,
  ],
  providers: [
    provideClientHydration(),
    {
      provide: LOCALE_ID, useValue: 'pt_BR'
    },
    {
      provide: DATE_PIPE_DEFAULT_OPTIONS,
      useValue: { dateFormat: 'dd/MM/yyyy' },
    },
    {
      provide: DEFAULT_CURRENCY_CODE,
      useValue: 'BRL',
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
