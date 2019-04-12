import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { FloodCell, PersistData, PersistDataFlood, PersistDataStats, FloodTutorial } from './flood.model';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal, NgbModal, NgbModalRef, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { WindowRef } from './windowref.service';

@Component({
  selector: 'flood-root',
  templateUrl: './flood.component.html',
  styleUrls: ['./flood.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class FloodComponent {

  constructor( private modalService: NgbModal, private _sanitizer: DomSanitizer, private winRef: WindowRef ) { }

  @ViewChild('popupConfirm') private popupConfirm;
  @ViewChild('popupSettings') private popupSettings;
  @ViewChild('popupHighscore') private popupHighscore;
  @ViewChild('popupHelp') private popupHelp;
  @ViewChild('popupTutorial') private popupTutorial;

  private createArray(arrLength){
    let arrTemp = new Array(arrLength || 0);
    for(var i = 0; i < arrLength; i++){
      arrTemp[i] = new Array(arrLength || 0);
    }
    return arrTemp;
  }

  private getRandom(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
  }

  persistData:PersistData = null;
  
  floodSize:number;
  arrFlood:FloodCell[];
  floodComplete:boolean = false;
  floodMoves:number = -1;
  maxMoves:number;
  limitLower:number = 0;
  limitUpper:number;
  arrDifficulty:any[] = [
    {"index": 0, "difficultyName": "Small", "gridSize": 12, "maxMoves": 22},
    {"index": 1, "difficultyName": "Medium", "gridSize": 18, "maxMoves": 34},
    {"index": 2, "difficultyName": "Large", "gridSize": 24, "maxMoves": 44}
  ];
  colorPalette:any[] = [
    {"index": 0, "paletteName": "Pastel"},
    {"index": 1, "paletteName": "Normal"},
    {"index": 2, "paletteName": "Pastel 2"},
    {"index": 3, "paletteName": "Pastel 3"}
  ];
  floodPalette = [
    {name: "Pastels", colours: ['#EEF093', '#FAA43A', '#FF7575', '#9588EC', '#2CA02C', '#2F74D0']},
    {name: "Retro", colours: ['#FFFF00', '#FFA500', '#FF0000', '#A020F0', '#00FF00', '#0000FF']},
    {name: "Dark Pastels", colours: ['#DD4456', '#29221F', '#0ABFBC', '#99EC46', '#FCF7C5', '#CD951D']},
    {name: "Yahoo!", colours: ['#48B0E0', '#F0F820', '#D84820', '#6060A8', '#789818', '#F070A0']},
    {name: "Cheer Up", colours: ["#556270", "#4ECDC4", "#C7F464", "#FF6B6B", "#C44D58", "#FFA661"]},
    {name: "Lotus Pond", colours: ["#FF68AF", "#F4FCE8", "#C3FF68", "#87D69B", "#4E9689", "#7ED0D6"]},
    {name: "Melon Ball Surprise", colours: ["#D1F2A5", "#EFFAB4", "#FFC48C", "#FF9F80", "#F56991", "#E99FBE"]},
    {name: "Rainy . . .", colours: ["#F6E3AB", "#B43F5A", "#4B1D37", "#70575B", "#869B88", "#C8AEAD"]},
    {name: "Night Glow", colours: ["#5E4040", "#F75BA0", "#F797C1", "#FFF3A4", "#9DCD4F", "#AF8585"]},
    {name: "Limeade on Ice", colours: ["#59A80F", "#9ED54C", "#C4ED68", "#E2FF9E", "#EAEECB", "#FFFFFF"]},
  ];

  selectedDifficulty:number = 0;
  selectedPalette:number = 0;
  arrColors:string[];
  floodStarted:boolean = false;
  floodMessage:string = "";
  floodPopupMessage:string = "";
  floodColor:number;

  settings:boolean = false;
  showPalette:boolean = false;
  showDifficulty:boolean = false;
  newHighscore:boolean = false;
  openPopup:NgbModalRef = null;

  display:any = {
    floodViewport: Math.floor(this.VW2PX(100) / this.floodSize) + "px",
    floodCellSize: null,
    floodKeySize: null,
    floodBorders: false
  }

  floodTutorial:FloodTutorial;
  floodTutorialMove:number = null;
  floodTutorialMessage:string = ""

  ngOnInit() {
    this.loadPersistData();
    this.initFlood();
  }

  loadPersistData() {
    if (this.winRef.nativeWindow.AppInventor) {
      this.persistData = JSON.parse(this.winRef.nativeWindow.AppInventor.getWebViewString());
    } else {
      this.persistData = JSON.parse(localStorage.getItem("floodPersist"));
    }

    if(this.persistData === null)
      this.persistData = new PersistData();
    //  console.log(this.persistData);
    //  debugger;

    if(this.persistData !== null) {
      this.selectedDifficulty = this.persistData.difficulty;
      this.display.floodBorders = this.persistData.borders;
      this.selectedPalette = this.persistData.palette;
      this.floodMoves = this.persistData.inProgress.movesDone;
      this.floodColor = this.persistData.inProgress.lastColor;
      this.arrFlood = this.persistData.inProgress.floodGrid;
    }
  }

  savePersistData(saveGrid:boolean = true) {
    this.persistData.difficulty = this.selectedDifficulty;
    this.persistData.borders = this.display.floodBorders;
    this.persistData.palette = this.selectedPalette;
    if(saveGrid) {
      this.persistData.inProgress.movesDone = this.floodMoves;
      this.persistData.inProgress.lastColor = this.floodColor;
      this.persistData.inProgress.floodGrid = this.arrFlood;
    }
    if (this.winRef.nativeWindow.AppInventor) {
      this.winRef.nativeWindow.AppInventor.setWebViewString(JSON.stringify(this.persistData));
    } else {
      localStorage.setItem("floodPersist", JSON.stringify(this.persistData));
    }
    // this.loadPersistData();
  }

  initFlood() {
    let tempCell:FloodCell;
    if(this.persistData !== null && this.persistData.inProgress.floodGrid !== null) {
      this.floodSize = this.persistData.inProgress.floodGrid.length;
    } else {
      this.floodSize = this.arrDifficulty[this.selectedDifficulty].gridSize;
    }
    this.arrFlood = this.createArray(this.floodSize);
    this.floodComplete = false;
    this.floodMoves = -1;
    this.maxMoves = this.arrDifficulty[this.selectedDifficulty].maxMoves;
    this.limitUpper = this.floodSize - 1;
    this.arrColors = this.floodPalette[this.selectedPalette].colours;
    this.floodStarted = false;
    this.floodMessage = "";
    this.floodColor = null;

    this.resizeViewport();

    if(this.persistData !== null) {
      this.floodColor = this.persistData.inProgress.lastColor;
      this.floodMoves = this.persistData.inProgress.movesDone;
      this.arrFlood = this.persistData.inProgress.floodGrid;
      this.floodStarted = true;
    }
    
    if(this.persistData.inProgress.floodGrid === null) {
      this.arrFlood = this.createArray(this.floodSize);

      for(var i = 0; i < this.floodSize; i++){
        for(var j = 0; j < this.floodSize; j++){
          tempCell = new FloodCell();
          tempCell.cellColor = this.getRandom(0, this.arrColors.length-1);
          this.arrFlood[i][j] = tempCell;
        }
      }

      this.arrFlood[0][0].isFlooded = true;
      this.floodColor = this.arrFlood[0][0].cellColor;
      this.goFlood(true);
    }
  }

  initTutorial() {
    let tempCell:FloodCell;
    let x:number, y:number;
    this.floodTutorial = new FloodTutorial();
    this.floodTutorialMove = -1;
    this.floodTutorial.arrFlood = this.createArray(this.floodTutorial.tutorialSize);
    this.floodTutorialMessage = "Click on the highlighted color in the palette to fill it in the grid from the top left cell and its adjacent cells of the same color.";

    for(var i = 0; i < this.floodTutorial.tutorialColors.length; i++) {
      x = Math.floor(i / this.floodTutorial.tutorialSize);
      y = i%this.floodTutorial.tutorialSize;
      tempCell = new FloodCell();
      tempCell.cellColor = this.floodTutorial.tutorialColors[i];
      this.floodTutorial.arrFlood[x][y] = tempCell;
    }
  }

  showTutorial() {
    this.openPopup.close();
    this.initTutorial();
    this.openPopup = this.modalService.open(this.popupTutorial, {});
  }

  startTutorialFlooding(floodColor) {
    if(floodColor === this.floodTutorial.tutorialMoves[this.floodTutorialMove+1]) {
      this.floodTutorialMove++;
      //this.floodTutorialMessage = "Click on the highlighted color in the palette to fill it in the grid from the top left cell and its adjacent cells of the same color.";
      this.goTutorialFlood();
    } 
  }

  goTutorialFlood() {
    let x:number, y:number;
    for(var i = 0; i < this.floodTutorial.tutorialColors.length; i++) {
      x = Math.floor(i / this.floodTutorial.tutorialSize);
      y = i%this.floodTutorial.tutorialSize;
      this.floodTutorial.arrFlood[x][y].cellColor = this.floodTutorial.tutorialSteps[this.floodTutorialMove][i];
    }
    if(this.floodTutorialMove === 6) {
      this.floodTutorialMessage = "You've done it. You've filled the whole grid with a single color :)";
    }
  }

  resizeViewport() {
    this.display.floodCellSize = Math.floor(this.VW2PX(96) / this.floodSize) + "px";
    this.display.floodKeySize = Math.floor(this.VW2PX(96) / 6) + "px";
  }

  setPalette(paletteIndex) {
    this.selectedPalette = paletteIndex;
    this.arrColors = this.floodPalette[this.selectedPalette].colours;
    this.showPalette = !this.showPalette;
    this.savePersistData(true);
  }

  setDifficulty(difficultyIndex) {
    this.selectedDifficulty = difficultyIndex;
    this.showDifficulty = !this.showDifficulty;
    this.savePersistData(true);
  }

  setBorders() {
    this.savePersistData(true);
  }

  resetStats() {
    this.persistData.floodStats = new PersistDataStats();
    this.savePersistData(true);
  }

  getColor(colorIndex) {
    return this._sanitizer.bypassSecurityTrustStyle(this.arrColors[colorIndex])
  }

  showSettings() {
    this.openPopup = this.modalService.open(this.popupSettings, {});
  }

  showHighscore() {
    this.openPopup = this.modalService.open(this.popupHighscore, {});
  }

  showHelp() {
    this.openPopup = this.modalService.open(this.popupHelp, {});

    // if(this.persistData.firstFlood) {
    //   this.openPopup = this.modalService.open(this.popupConfirm, {});
    //   this.floodPopupMessage = "Looks like this is your first time here. Would you like to play the tutorial level ?";
    //   this.openPopup.result.then (
    //     (result) => {
    //       this.showTutorial();
    //     },
    //     (reason) => {}
    //   )
    // }

  }

  startNewFlood() {
    if(this.floodStarted && this.floodMoves > 0) {
      this.floodPopupMessage = "Start new Flood ?";
      this.modalService.open(this.popupConfirm, {}).result.then (
        (result) => {
          this.persistData.floodStats.played[this.selectedDifficulty]++;
          this.persistData.inProgress = new PersistDataFlood();
          this.floodStarted = false;
          this.savePersistData(false);
          this.initFlood();
        },
        (reason) => {}
      )
    } else {
      this.persistData.inProgress = new PersistDataFlood();
      this.floodStarted = false;
      this.savePersistData(false);
      this.initFlood(); 
    }
  }

  startFlooding(floodColor) {
    if(!this.floodStarted && !this.floodComplete)
      this.floodStarted = true;
    this.floodColor = floodColor;
    this.goFlood(false);
  }

  goFlood(init) {
    if(this.floodComplete) return;

    let prevColor = this.arrFlood[0][0].cellColor;
    if(!init && this.floodColor === prevColor) return;

    this.floodMoves++;
    for(var i = 0; i < this.floodSize; i++) {
      for(var j = 0; j < this.floodSize; j++) {
        if(this.arrFlood[i][j].isFlooded){
          this.floodCell(i, j);
        }
      }
    }
    for(var i = 0; i < this.floodSize; i++) {
      for(var j = 0; j < this.floodSize; j++) {
        if(this.arrFlood[i][j].isFlooded){
          this.floodNeighbours(i, j);
        }
      }
    }

    this.savePersistData(true);

    if(this.allFlooded()) {
      this.floodComplete = true;
      this.floodStarted = false;
      this.persistData.inProgress = new PersistDataFlood();
      if(this.floodMoves <= this.maxMoves) {
        this.floodMessage = "You Win";
        if(this.persistData.floodStats.scores[this.selectedDifficulty] !== 0) {
          if(this.floodMoves < this.persistData.floodStats.scores[this.selectedDifficulty]) {
            this.persistData.floodStats.scores[this.selectedDifficulty] = this.floodMoves;
            this.showHurrah();
          }
        } else {
          this.persistData.floodStats.scores[this.selectedDifficulty] = this.floodMoves;
          this.showHurrah();
        }
        this.persistData.floodStats.won[this.selectedDifficulty]++;
      } else {
        this.floodMessage = "You Lose";
      }
      this.persistData.floodStats.played[this.selectedDifficulty]++;
      this.savePersistData(false);
    } else if (this.floodMoves == this.maxMoves) {
      this.floodComplete = true;
      this.floodStarted = false;
      this.persistData.inProgress = new PersistDataFlood();
      this.floodMessage = "You Lose";
      this.persistData.floodStats.played[this.selectedDifficulty]++;
      this.savePersistData(false);
    }
  }

  floodCell(X, Y) {
    this.arrFlood[X][Y].cellColor = this.floodColor;
  }

  floodNeighbours(X, Y) {
    if(X < this.floodSize-1) this.checkFlood(X+1, Y);
    if(X > 0) this.checkFlood(X-1, Y);
    if(Y < this.floodSize-1) this.checkFlood(X, Y+1);
    if(Y > 0) this.checkFlood(X, Y-1);
  }

  checkFlood(X, Y) {
    if(this.arrFlood[X][Y].isFlooded) return;
    if(this.arrFlood[X][Y].cellColor === this.floodColor) {
      this.arrFlood[X][Y].isFlooded = true;
      this.floodNeighbours(X, Y);
    }
  }

  allFlooded() {
    for(var i = 0; i < this.floodSize; i++){
      for(var j = 0; j < this.floodSize; j++){
        if(!this.arrFlood[i][j].isFlooded) return false;
      }
    }
    return true;
  }

  VW2PX(VW){
    let w = window, d = document, e = d.documentElement, g = d.getElementsByTagName('body')[0];
    let x = w.innerWidth || e.clientWidth || g.clientWidth;
    let result = (x * VW ) / 100;
    return result;
  }

  showHurrah() {
    this.newHighscore = true;
    setTimeout(() => {
      this.newHighscore = false;
    }, 5000);
  }

}
