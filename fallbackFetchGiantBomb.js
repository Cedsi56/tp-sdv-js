(function() {
	const fetchOriginal = window.fetch;
	window.fetch = (input, init)=>{
		if (input.includes("giantbomb")) {
			return fetchGiantBomb(input);
		} else {
			return fetchOriginal(input, init);
		}
	};

	/**
	 *
	 * @param url
	 * @returns {Promise<Response>}
	 */
	const fetchGiantBomb = (url, init)=>{
		return new Promise((resolve, reject)=>{
			const urlJsonP = url.replace(/format=json([^p])|format=json$/, "format=jsonp$1");
			const urlFinale = urlJsonP + "&json_callback=callbackFetchGiantBomb";

			//TODO : REPLACE JSON PAR JSONP
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = urlFinale;

			const reinit = ()=>{
				script.remove();
				delete window.callbackFetchGiantBomb;
				window.removeEventListener("error", callbackError);
			};
			const callbackError = (e)=>{
				if (e.filename && e.filename.includes("callbackFetchGiantBomb")) {
					e.preventDefault();
					reinit();
					reject();
				}
			};

			window.addEventListener("error", callbackError);

			window.callbackFetchGiantBomb = (data)=>{
				const response = new Response();
				let bodyConsomme = false;
				response.json = async ()=>{
					if (bodyConsomme) {
						throw new Error("Response.json: Body has already been consumed.")
					}
					bodyConsomme = true;
					return data;
				};
				response.text = async ()=>{
					if (bodyConsomme) {
						throw new Error("Response.text: Body has already been consumed.")
					}
					bodyConsomme = true;
					return JSON.stringify(data);
				}
				reinit();
				resolve(response);
			};

			document.querySelector('head').append(script);
		});
	}
})();