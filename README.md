# Disegnatore_alberi_force-directed

Questo progetto dimostra come creare un layout a albero dinamico con animazione utilizzando D3.js (Data-Driven Documents).

## Contenuto del Progetto

- **index.html**: File HTML che funge da punto di ingresso per il progetto. Include la struttura HTML necessaria, i collegamenti alla libreria D3.js e fa riferimento al file JavaScript `tree_drawer.js`.

- **tree_drawer.js**: File JavaScript che contiene il codice per generare e animare il layout a albero con D3.js. Ecco una panoramica dei contenuti:

  - **Inizializzazione**: Configurazione del canvas SVG e definizione delle dimensioni e dei margini per il layout a albero.

  - **Generazione dei Dati**: La funzione `generateRandomTree` genera dati gerarchici casuali con una profondità specificata e un numero massimo di figli per nodo.

  - **Layout a Albero**: Utilizzo del layout a albero di D3 (`d3.tree()`) per calcolare le posizioni dei nodi basate sui dati gerarchici.

  - **Aggiornamento e Animazione**: Le funzioni `update` e `addNodesRecursively` aggiornano e animano il layout a albero con nodi e collegamenti. I nodi vengono aggiunti in modo ricorsivo con un ritardo per simulare l'animazione.

  - **Misurazione dei Tempi di Esecuzione**: Misurazione del tempo totale di esecuzione della simulazione force-directed e stampa del risultato sulla console.

  - **Scala dei Colori**: I nodi vengono colorati dinamicamente in base alla loro profondità utilizzando la scala di colori ordinale di D3.

- **force-directed-classico.js**: File JavaScript aggiunto per implementare un algoritmo force-directed classico con D3.js. Questo file contiene:

  - **Inizializzazione**: Configurazione del canvas SVG e definizione delle dimensioni del layout.

  - **Generazione dei Nodi e Collegamenti**: Creazione casuale di nodi e collegamenti tra di essi.

  - **Simulazione Force-Directed**: Utilizzo della simulazione force-directed di D3 per posizionare dinamicamente i nodi e i collegamenti.

  - **Gestione del Drag-and-Drop**: Implementazione del drag-and-drop per interagire con i nodi.

  - **Misurazione dei Tempi di Esecuzione**: Misurazione del tempo totale di esecuzione della simulazione force-directed e stampa del risultato sulla console.

## Utilizzo

1. Clona la repository o scarica i file (`index.html`, `classico.html`, `tree_drawer.js`, e `force-directed-classico.js`).
2. Apri `index.html` e `classico.html` in un browser web che supporta JavaScript e SVG.
3. Il layout a albero con nodi animati si renderizzerà nella finestra del browser. I nodi appariranno gradualmente, dimostrando la struttura gerarchica.

## Tecnologie Utilizzate

- **D3.js**: Libreria JavaScript per manipolare documenti basati su dati. Utilizzata per creare visualizzazioni di dati interattive e dinamiche.
