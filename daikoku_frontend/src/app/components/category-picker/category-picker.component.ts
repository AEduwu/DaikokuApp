import { Component, OnInit, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
  IonLabel, IonIcon, IonGrid, IonRow, IonCol,
  IonSearchbar, IonText, IonInput, IonSpinner, IonItem,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  closeOutline, addOutline, checkmarkOutline,
  restaurantOutline, carOutline, homeOutline, medkitOutline,
  shirtOutline, schoolOutline, gameControllerOutline, airplaneOutline,
  cashOutline, briefcaseOutline, laptopOutline, giftOutline,
  heartOutline, musicalNotesOutline, fitnessOutline, pawOutline,
  cartOutline, phonePortraitOutline, tvOutline, busOutline,
  waterOutline, flashOutline, wifiOutline, bookOutline
} from 'ionicons/icons';
import { AVAILABLE_ICONS } from '../transaction-modal/transaction-modal.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  category_name: string;
  category_icon: string;
}

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  standalone: true,
  imports: [
    FormsModule, CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons,
    IonLabel, IonIcon, IonGrid, IonRow, IonCol,
    IonSearchbar, IonText, IonInput, IonSpinner, IonItem,
  ]
})
export class CategoryPickerComponent implements OnInit {

  @Input() categories: Category[] = [];

  vista          = 'list';
  busqueda       = '';

  newName        = '';
  newIcon        = 'cash-outline';
  availableIcons = AVAILABLE_ICONS;
  saving         = false;
  error          = '';

  private apiUrl = environment.apiUrl;

  constructor(
    private modalCtrl: ModalController,
    private http: HttpClient
  ) {
    addIcons({
      closeOutline, addOutline, checkmarkOutline,
      restaurantOutline, carOutline, homeOutline, medkitOutline,
      shirtOutline, schoolOutline, gameControllerOutline, airplaneOutline,
      cashOutline, briefcaseOutline, laptopOutline, giftOutline,
      heartOutline, musicalNotesOutline, fitnessOutline, pawOutline,
      cartOutline, phonePortraitOutline, tvOutline, busOutline,
      waterOutline, flashOutline, wifiOutline, bookOutline
    });
  }

  ngOnInit() {}

  get categoriasFiltradas(): Category[] {
    if (!this.busqueda.trim()) return this.categories;
    return this.categories.filter(c =>
      c.category_name.toLowerCase().includes(this.busqueda.toLowerCase())
    );
  }

  seleccionar(cat: Category) {
    this.modalCtrl.dismiss({ category: cat }, 'selected');
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async guardarNuevaCategoria() {
    if (!this.newName.trim()) {
      this.error = 'Ingresa un nombre.';
      return;
    }

    this.error  = '';
    this.saving = true;

    this.http.post<Category>(`${this.apiUrl}/categories/`, {
      category_name: this.newName.trim(),
      category_icon: this.newIcon
    }).subscribe({
      next: (cat) => {
        this.saving = false;
        this.modalCtrl.dismiss({ category: cat }, 'selected');
      },
      error: () => {
        this.saving = false;
        this.error  = 'Error al crear la categoría.';
      }
    });
  }
}