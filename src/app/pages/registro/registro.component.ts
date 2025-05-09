import { Component, OnInit } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { HeaderComponent } from '../../shared/components/pages/header/header.component';
import { FooterComponent } from "../../shared/components/pages/footer/footer.component";

import { ICatalogo } from '../../core/interfaces/catalogo/catalogo.interface';
import { IRegistro } from '../../core/interfaces/usuario/registro.interface';

import { CatalogoService } from '../../core/services/catalogo/catalogo.service';
import { UsuarioService } from '../../core/services/usuario/usuario.service';
import { GlobalfunctionsService } from '../../core/services/global-functions/global-functions.service';

import { contraseniaFuerteValidator, correoElectronicoValidator, edadMinimaValidator } from '../../core/utils';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from 'primeng/datepicker';
import { FloatLabel } from 'primeng/floatlabel';
import { InputMask } from 'primeng/inputmask';
import { Checkbox } from 'primeng/checkbox';
import { Select, SelectChangeEvent } from 'primeng/select';
import { DividerModule } from 'primeng/divider';
import { PasswordModule } from 'primeng/password';
import { edadSegunTipoUsuarioValidator } from '../../core/utils/validators/edad.validator';
import { ToastService } from '../../core/services/messages/toast.service';
import { IResponse } from '../../core/interfaces/web-api/web-api.interface';
import { BlockUserIService } from '../../core/services/blockUI/block-user-i.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CardModule, ButtonModule, InputTextModule,
    FormsModule, FloatLabel, DatePicker, InputMask, Checkbox,
    Select, CommonModule, ReactiveFormsModule, PasswordModule, DividerModule,
    RouterModule
  ],
  // providers: [ToastService],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {

  //#region Propiedades
  public allTipoUsuario: ICatalogo[] = [];
  public allEstados: ICatalogo[] = [];
  public allMunicipios: ICatalogo[] = [];
  public aceptoTerrminos: boolean = false;
  public formulario: FormGroup;
  public hoy:Date = new Date();
  public estadoSeleccionado: boolean = false;
  //#endregion Propiedades

  //#endregion Constructor
  constructor(
    private readonly catalagoService: CatalogoService, private readonly usuarioService:UsuarioService,
    private readonly globalFunctionsService:GlobalfunctionsService, private fb: FormBuilder,
    private readonly toastService: ToastService, private readonly blockUserIService:BlockUserIService,
    private readonly router:Router
  ) {
    this.formulario = this.fb.group({
      nombre: new FormControl('', Validators.required),
      apellidoPaterno: new FormControl('', Validators.required),
      apellidoMaterno: new FormControl('', Validators.required),
      fechaNacimiento: new FormControl('', {
        validators: [Validators.required, edadMinimaValidator(12)]
      }),
      estado: new FormControl('', Validators.required),
      municipio: new FormControl({value: '', disabled: true}, Validators.required),
      residencia: new FormControl('', Validators.required),
      correo: new FormControl('', {
        validators: [Validators.required, correoElectronicoValidator()]
      }),
      telefono: new FormControl('', Validators.required),
      tipoUsuario: new FormControl('', {
        validators: [Validators.required]
      }),
      contrasena: new FormControl('', {
        validators: [Validators.required, Validators.minLength(8), contraseniaFuerteValidator()]
      }),
      aceptaTerminos: new FormControl(false, Validators.requiredTrue)
    },{ validators: edadSegunTipoUsuarioValidator() }
    );
  }
  //#endregion Constructor

  //#region Ng
  ngOnInit(): void {
   this.inicializa();
  }
  //#endregion Ng

  //#region Generales
  private inicializa(): void {
    this.catalagoService.getAllTipoUsuario().subscribe( (tipoUsuario) => {
      this.allTipoUsuario = tipoUsuario;
    });

    this.catalagoService.getAllEstado().subscribe( (estado) => {
      this.allEstados = estado;
    });
  }

  public onCambiaEstado(event: SelectChangeEvent) {
    this.catalagoService.getAllMunicipioByEstado(event.value.id).subscribe( (municipio) => {
      this.allMunicipios = municipio;
      this.formulario.controls['municipio'].enable();
    });
  }

  public guardar(): void {
    if(this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    } else if (this.formulario.valid) {
      this.globalFunctionsService.aplicaTrim(this.formulario);
      const registro = this.formulario.value as IRegistro;
      this.blockUserIService.show();
      this.usuarioService.save(registro).subscribe({
        next: (response:IResponse<any>) => {
          this.toastService.showMessage('success', 'Genial', response.mensaje, 5000);
          this.formulario.reset();
          this.blockUserIService.hide();
          this.router.navigateByUrl('/portal');
        },
        error: (error) => {
          this.toastService.showMessage('error', 'Error', error.error.message);
          this.blockUserIService.hide();
        }
      });
    }
  }

  public esValido(campo: string):boolean| null {
    return this.globalFunctionsService.esCampoValido(this.formulario, campo);
  }

  public getErrores(campo: string, nombreMostrar:string):string | null {
    const errores = this.globalFunctionsService.getCampoError(this.formulario, campo, nombreMostrar);
    return errores;

  }

  //#endregion Generales
}
