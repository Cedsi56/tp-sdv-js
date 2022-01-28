import DivSelectionJeu from './DivSelectionJeu';
import ListeJeux from '../ListeJeux';

export default class Jeu {
	name;
	image;
	image_small;
	platforms;
	divCustom;
	alreadyReleased;
	date;
	shortDesc;
	longDesc;

	constructor(jeu, fromStorage){
		if (!fromStorage){
			this.image = jeu.image.screen_url;
			this.image_small = jeu.image.small_url;

			if (jeu.original_release_date != null){
				this.date = jeu.original_release_date;
				this.alreadyReleased = true;
			} else {
				this.alreadyReleased = false;
				if (jeu.expected_release_year != null) {
					this.date = jeu.expected_release_year;
				} else {
					this.date = "Date de sortie inconnue"
				}
			}

			if (jeu.deck != null) {
				this.shortDesc = jeu.deck;
			} else {
				this.shortDesc = 'Pas de résumé disponible.';
			}
			
			if (jeu.description != null) {
				this.longDesc = jeu.description;
			} else {
				this.longDesc = "Pas de description disponible";
			}
		} else {
			this.image = jeu.image;
			this.image_small = jeu.image_small;
			this.alreadyReleased = jeu.alreadyReleased;
			this.date = jeu.date;
			this.shortDesc = jeu.shortDesc;
			this.longDesc = jeu.longDesc;
		}
		this.name = jeu.name;
		this.platforms = jeu.platforms;


		



		let onclick = function(jeu) {
			ListeJeux.displayGame(jeu);
		}

		this.divCustom = new DivSelectionJeu(this, onclick);
	}
}