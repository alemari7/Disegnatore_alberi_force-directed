# Disegnatore_alberi_force-directed

Questo progetto dimostra come creare un layout a albero dinamico con animazione utilizzando D3.js (Data-Driven Documents).

## Contenuto del Progetto

- **index.html**: File HTML che funge da punto di ingresso per il progetto. Include la struttura HTML necessaria, i collegamenti alla libreria D3.js e fa riferimento al file JavaScript `tree_drawer.js`.

- **tree_drawer.js**: File JavaScript aggiunto per implementare un algoritmo force-directed con D3.js per l'aggiunta dei nodi in maniera incrementale. Questo file contiene:
   
   - **Inizializzazione**: Configura il canvas SVG con dimensioni e margini. Crea un gruppo `g` per contenere gli elementi dell'albero.
   
   - **Zoom**: Abilita il supporto allo zoom sul canvas SVG per permettere l'interazione dell'utente con l'albero.
   
   - **Generazione dei Dati**: La funzione `generateRandomTree` crea una struttura gerarchica casuale con nodi e collegamenti.
   
   - **Simulazione Force-Directed**: Utilizza D3.js per simulare il layout force-directed dell'albero, posizionando dinamicamente i nodi e i collegamenti.
   
   - **Colorazione dei Nodi**: I nodi vengono colorati in base alla loro profondità nell'albero.
   
   - **Gestione dell'Animazione**: Aggiunge nodi in modo ricorsivo con un ritardo per simulare l'animazione di crescita dell'albero.
   
   - **Interazione con i Nodi**: Implementa il trascinamento dei nodi per spostarli manualmente all'interno del canvas.
 
   - **Misurazione dei Tempi di Esecuzione**: Misurazione del tempo totale di esecuzione della simulazione force-directed e stampa del risultato sulla console. Tempo totale di esecuzione rilevato con profondità 5 e numero massimo di figli pari a 5: 15.014 secondi

- **index.css**: File CSS che definisce lo stile visivo per l'header, i controlli, il contenitore della visualizzazione, e i nodi e collegamenti dell'albero. 

## Utilizzo

1. Clona la repository o scarica i file (`index.html`, `tree_drawer.js`, e `index.css`).
2. Apri `index.html` in un browser web che supporta JavaScript e SVG.
3. Il layout a albero con nodi animati si renderizzerà nella finestra del browser. I nodi appariranno gradualmente, dimostrando la struttura gerarchica.

## Tecnologie Utilizzate

- **D3.js**: Libreria JavaScript per manipolare documenti basati su dati. Utilizzata per creare visualizzazioni di dati interattive e dinamiche.
