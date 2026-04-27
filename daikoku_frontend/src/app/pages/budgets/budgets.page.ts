import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
  IonBackButton, IonButton, IonIcon, IonItem, IonLabel,
  IonList, IonProgressBar, IonNote, IonFab, IonFabButton,
  AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, trashOutline, createOutline } from 'ionicons/icons';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Budget {
  id: number;
  category: number;
  category_name: string;
  category_icon: string;
  amount: number;
  month: string;
  spent_amount: number;
  remaining_amount: number;
  progress_percentage: number;
}

interface Category {
  id: number;
  category_name: string;
  category_icon: string;
}

@Component({
  selector: 'app-budgets',
  templateUrl: './budgets.page.html',
  styleUrls: ['./budgets.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, DecimalPipe,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButtons,
    IonBackButton, IonButton, IonIcon, IonItem, IonLabel,
    IonList, IonProgressBar, IonNote, IonFab, IonFabButton,
  ]
})
export class BudgetsPage implements OnInit {

  budgets: Budget[]      = [];
  categories: Category[] = [];
  monthlyBudget          = 0;
  totalPresupuestado     = 0;
  totalGastado           = 0;
  loading                = false;

  currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private alertCtrl: AlertController,
  ) {
    addIcons({ addOutline, trashOutline, createOutline });
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ionViewWillEnter() {
    this.cargarDatos();
  }

  get disponible(): number {
    return this.monthlyBudget - this.totalPresupuestado;
  }

  get presupuestoUsadoPct(): number {
    if (this.monthlyBudget <= 0) return 0;
    return Math.min(this.totalGastado / this.monthlyBudget * 100, 100);
  }

  cargarDatos() {
    this.loading = true;

    this.http.get<any>(`${this.apiUrl}/auth/profile/`).subscribe({
      next: user => {
        this.monthlyBudget = parseFloat(user.monthly_budget) || 0;
      }
    });

    this.http.get<Budget[]>(`${this.apiUrl}/budgets/?month=${this.currentMonth}`).subscribe({
      next: data => {
        this.budgets            = data;
        this.totalPresupuestado = data.reduce((s, b) => s + Number(b.amount), 0);
        this.totalGastado       = data.reduce((s, b) => s + Number(b.spent_amount), 0);
        this.loading            = false;
      },
      error: () => { this.loading = false; }
    });

    this.http.get<Category[]>(`${this.apiUrl}/categories/`).subscribe({
      next: cats => { this.categories = cats; }
    });
  }

  async agregarPresupuesto() {
    const categoriasDisponibles = this.categories
      .filter(c => !this.budgets.find(b => b.category === c.id))
      .map(c => ({ type: 'radio', label: c.category_name, value: c.id }));

    if (categoriasDisponibles.length === 0) {
      const alert = await this.alertCtrl.create({
        header: 'Sin categorías',
        message: 'Ya tienes presupuesto para todas las categorías disponibles.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alertCat = await this.alertCtrl.create({
      header: 'Selecciona una categoría',
      inputs: categoriasDisponibles as any,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Siguiente',
          handler: (categoryId) => {
            if (!categoryId) return false;
            this.pedirMonto(categoryId);
            return true;
          }
        }
      ]
    });
    await alertCat.present();
  }

  async pedirMonto(categoryId: number) {
    const alert = await this.alertCtrl.create({
      header: 'Monto del presupuesto',
      inputs: [
        {
          name: 'amount',
          type: 'number',
          placeholder: '0',
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const amount = parseFloat(data.amount);
            if (!amount || amount <= 0) return false;
            this.guardarPresupuesto(categoryId, amount);
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  guardarPresupuesto(categoryId: number, amount: number) {
    this.http.post(`${this.apiUrl}/budgets/`, {
      category: categoryId,
      amount,
      month: this.currentMonth
    }).subscribe({
      next: () => this.cargarDatos(),
      error: () => {}
    });
  }

  async editarPresupuesto(budget: Budget) {
    const alert = await this.alertCtrl.create({
      header: `Editar — ${budget.category_name}`,
      inputs: [
        {
          name: 'amount',
          type: 'number',
          value: budget.amount,
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            const amount = parseFloat(data.amount);
            if (!amount || amount <= 0) return false;
            this.http.patch(`${this.apiUrl}/budgets/${budget.id}/`, { amount }).subscribe({
              next: () => this.cargarDatos(),
              error: () => {}
            });
            return true;
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarPresupuesto(budget: Budget) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar presupuesto',
      message: `¿Eliminar el presupuesto de ${budget.category_name}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.http.delete(`${this.apiUrl}/budgets/${budget.id}/`).subscribe({
              next: () => this.cargarDatos(),
              error: () => {}
            });
          }
        }
      ]
    });
    await alert.present();
  }
}