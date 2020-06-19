import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import { FileItem } from '../models/file-item';

@Injectable({
  providedIn: 'root'
})
export class CargaImagenesService {
  private CARPETA_IMAGENES = 'img';
  constructor( private db: AngularFirestore) { }

  cargarImagenesFirebase( imagenes: FileItem[] ) {
    // referencia al storage de firebase
    const storageRef = firebase.storage().ref();
    debugger
    for ( const item of imagenes ) {

      item.estaSubiendo = true;
      if ( item.progreso >= 100 ) {
        continue;
      }

      const uploadTask: firebase.storage.UploadTask =
                  storageRef.child(`${ this.CARPETA_IMAGENES }/${ item.nombreArchivo }`)
                            .put( item.archivo );

      uploadTask.on( firebase.storage.TaskEvent.STATE_CHANGED,
              ( snapshot: firebase.storage.UploadTaskSnapshot ) =>
                          item.progreso = ( snapshot.bytesTransferred / snapshot.totalBytes ) * 100,
              ( error ) => console.error('Error al subir', error ),
              () => {

                console.log('Imagen cargada correctamente');
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                  item.estaSubiendo = false;
                  item.url = downloadURL;
                  this.guardarImagen({
                    nombre: item.nombreArchivo,
                    url: item.url
                  });
                });
              });


    }
  }
  private guardarImagen(imagen: { nombre: string, url: string}) {
    debugger
    this.db.collection(`/${ this.CARPETA_IMAGENES }`)
           .add( imagen );
  }
}
