
export class FloodCell {
	constructor (
		public isFlooded ?: boolean,
		public cellColor ?: number
	) {
		this.isFlooded = false;
		this.cellColor = null;
	}
}

export class PersistData {
	constructor (
		// public firstFlood ?: boolean,
		public difficulty ?: number,
		public palette ?: number,
		public borders ?: boolean,
		public inProgress ?: PersistDataFlood,
		public floodStats ?: PersistDataStats
	) {
		// this.firstFlood = true;
		this.difficulty = 0;
		this.borders = false;
		this.palette = 0;
		this.inProgress = new PersistDataFlood();
		this.floodStats = new PersistDataStats();
	}
}

export class PersistDataFlood {
	constructor (
		public movesDone ?: number,
		public lastColor ?: number,
		public floodGrid ?: FloodCell[]
	) {
		this.movesDone = -1;
		this.lastColor = null;
		this.floodGrid = null;
	}

}

export class PersistDataStats {
	constructor (
		public scores ?: number[],
		public played ?: number[],
		public won ?: number[]
	) {
		this.scores = [0, 0, 0];
		this.played = [0, 0, 0];
		this.won = [0, 0, 0];
	}

}

export class FloodTutorial {
	constructor (
		public tutorialSize ?: number,
		public tutorialColors ?: number[],
		public tutorialSteps ?: any[],
		public tutorialMoves ?: number[],
		public arrFlood ?: FloodCell[]
	) {
		this.tutorialSize = 4;
		this.tutorialColors = [0, 4, 5, 1, 2, 4, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4];
		this.tutorialSteps = [
			[4, 4, 5, 1, 2, 4, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4],
			[3, 3, 5, 1, 2, 3, 3, 2, 5, 3, 1, 0, 2, 0, 0, 4],
			[5, 5, 5, 1, 2, 5, 5, 2, 5, 5, 1, 0, 2, 0, 0, 4],
			[2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1, 0, 2, 0, 0, 4],
			[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 4],
			[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
			[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4]
		]
		this.tutorialMoves = [4, 3, 5, 2, 1, 0, 4];
		this.arrFlood = null;
	}
}