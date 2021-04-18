import { Injectable, ComponentRef, Injector } from "@angular/core";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, PortalInjector } from "@angular/cdk/portal";

import { CarDetesComponent } from "./car-detes.component";
import { CarDetesOverlayRef } from './car-detes-overlay-ref';
import { CAR_DETES_DIALOG_DATA } from './car-detes-overlay.tokens';

@Injectable()
export class CarDetesOverlay {

  constructor(
    private injector: Injector,
    private overlay: Overlay
  ){}

  open(id: number) {
    const overlayRef = this.overlay.create(
      {
        backdropClass: "dark-backdrop",
        hasBackdrop: true,
        height: 520,
        width: 1000,
        panelClass: "tm-file-preview-dialog-panel",
        positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
        scrollStrategy: this.overlay.scrollStrategies.close()
      }
    );
    const dialogRef = new CarDetesOverlayRef(overlayRef);
    const overlayComponent = this.attachDialogContainer(overlayRef, id, dialogRef);

    overlayRef.backdropClick().subscribe(_ => dialogRef.close());

    return dialogRef;
  }

 private attachDialogContainer(overlayRef: OverlayRef, id: number, dialogRef: CarDetesOverlayRef) {
   const injector = this.createInjector(id, dialogRef);
   const containerPortal = new ComponentPortal(CarDetesComponent, null, injector);
   const containerRef: ComponentRef<CarDetesComponent> = overlayRef.attach(containerPortal);

   return containerRef.instance;
 }

  private createInjector(id: number, dialogRef: CarDetesOverlayRef): PortalInjector
  {
    const injectionTokens = new WeakMap();

    injectionTokens.set(CAR_DETES_DIALOG_DATA, id);
    injectionTokens.set(CarDetesOverlayRef, dialogRef);

    return new PortalInjector(this.injector, injectionTokens);
  }
}
