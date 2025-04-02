let cards = [];
let secretCard;
let attemptsLeft = 5;

fetch('cardsES.json')
    .then(response => response.json())
    .then(data => {
        cards = data;

        function randomSeed(seed) {
            let x = Math.sin(seed) * 10000; 
            return x - Math.floor(x);
        }

        const now = new Date();
        const dateSeed = parseInt(now.getFullYear().toString() + (now.getMonth() + 1).toString().padStart(2, '0') + now.getDate().toString().padStart(2, '0'));
        const randomIndex = Math.floor(randomSeed(dateSeed) * cards.length);

        secretCard = cards[randomIndex];
    })
    .catch(error => console.error("Error loading card data:", error));

document.getElementById("guessInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

function checkGuess() {
	const follower = "Combatientes"
    let userGuess = document.getElementById("guessInput").value.trim();
    let feedback = document.getElementById("feedback");
    let attemptsDisplay = document.getElementById("attempts");
    let hintsContainer = document.getElementById("hints");

    let guessedCard = cards.find(c => c.Name.toLowerCase() === userGuess.toLowerCase());

    if (!guessedCard) {
        feedback.innerText = "❌ Card not found !";
        return;
    }

    let hintBlock = document.createElement("div");
    hintBlock.classList.add("hint-block");

    let hintTitle = document.createElement("h3");
    hintTitle.innerHTML = `Attempt ${6 - attemptsLeft}: <a href="https://shadowverse-portal.com/card/${guessedCard.ID}">${guessedCard.Name}</a>`;
    hintBlock.appendChild(hintTitle);

    let firstPrintComparison = compareExpansionDates(guessedCard.FirstPrint, secretCard.FirstPrint);
    
    if (guessedCard.hasOwnProperty("SecondPrint") && secretCard.hasOwnProperty("SecondPrint")) {
        let secondPrintComparison = compareExpansionDates(guessedCard.SecondPrint, secretCard.SecondPrint);
    }

    if (guessedCard.hasOwnProperty("ThirdPrint") && secretCard.hasOwnProperty("ThirdPrint")) {
        let thirdPrintComparison = compareExpansionDates(guessedCard.ThirdPrint, secretCard.ThirdPrint);
    }
	
    let craftComparison = compareRawValues(guessedCard.Craft, secretCard.Craft, "Craft");
    let typeComparison = compareRawValues(guessedCard.Type, secretCard.Type, "Type");
    let traitComparison = compareRawValues(guessedCard.Trait, secretCard.Trait, "Trait");

    let costComparison = compareNumbers(guessedCard.Cost, secretCard.Cost, "Cost");
	let atkComparison = "";
	let hpComparison = "";
	let evolvedAtkComparison = "";
	let evolvedHpComparison = "";
    if (guessedCard.Type == follower && secretCard.Type == follower) {
		atkComparison = compareNumbers(guessedCard.ATK, secretCard.ATK, "Attack");
		hpComparison = compareNumbers(guessedCard.HP, secretCard.HP, "Health");
		evolvedAtkComparison = compareNumbers(guessedCard.EvolvedATK, secretCard.EvolvedATK, "Evolved Attack");
		evolvedHpComparison = compareNumbers(guessedCard.EvolvedHP, secretCard.EvolvedHP, "Evolved Health");
    }
	
    let rarityComparison = compareRarity(guessedCard.Rarity, secretCard.Rarity);

	let hintText = `<p>Craft: ${craftComparison}</p>
					<p>Type: ${typeComparison}</p>
					<p>Trait: ${traitComparison}</p>
					<p>First Print: ${firstPrintComparison}</p>`;
	
    if (guessedCard.hasOwnProperty("SecondPrint") && secretCard.hasOwnProperty("SecondPrint")) {
		if (guessedCard.hasOwnProperty("ThirdPrint") && secretCard.hasOwnProperty("ThirdPrint")) {
			hintText = hintText + `<p>Second Print: ${secondPrintComparison}</p>
								   <p>Third Print: ${thirdPrintComparison}</p>`;
		} else {
			hintText = hintText + `<p>Second Print: ${secondPrintComparison}</p>`;
		}
	}
	hintText = hintText + `<p>Cost: ${costComparison}</p>`;
    if (guessedCard.Type == follower && secretCard.Type == follower) {
	  hintText = hintText + `<p>Attack: ${atkComparison}</p>
							 <p>Health: ${hpComparison}</p>
							 <p>Evolved Attack: ${evolvedAtkComparison}</p>
							 <p>Evolved Health: ${evolvedHpComparison}</p>`;
    }
	hintText = hintText + `<p>Rarity: ${rarityComparison}</p>`;
	
    hintBlock.innerHTML += hintText;
    hintsContainer.prepend(hintBlock);

    if (guessedCard.Name === secretCard.Name) {
        feedback.innerHTML = `🎉 Correct! The answer was <a href="https://shadowverse-portal.com/card/${secretCard.ID}"><b>${secretCard.Name}</b></a>.`;
		disableSubmitButton();
        document.getElementById("guessInput").disabled = true;
        return;
    }

    attemptsLeft--;
    attemptsDisplay.innerText = `Attempts left: ${attemptsLeft}`;

    if (attemptsLeft <= 0) {
        feedback.innerHTML += `<br>💀 Game Over! The correct answer was <a href="https://shadowverse-portal.com/card/${secretCard.ID}"><b>${secretCard.Name}</b></a>.`;
		disableSubmitButton();
        document.getElementById("guessInput").disabled = true;
    }

    document.getElementById("guessInput").value = "";
}

function compareRawValues(guessedValue, secretValue, attributeName) {
	if (guessedValue === secretValue) {
        return `✅ Correct! (Guessed ${attributeName}: ${guessedValue})`;
    } else {
		if (guessedValue.includes(secretValue)) {
			return `⚠️ Partially correct! (Guessed ${attributeName}: ${guessedValue})`;
		} else {
			return `❌ Incorrect! (Guessed ${attributeName}: ${guessedValue})`;
		}
    }
}

function compareRarity(guessedRarity, secretRarity) {
    if (guessedRarity.ID === secretRarity.ID) {
        return `✅ Correct! (${secretRarity.Name})`;
    } else if (guessedRarity.ID > secretRarity.ID) {
        return `⬇️ Lower! (Guessed Rarity: ${guessedRarity.Name})`;
	} else {
        return `⬆️ Higher! (Guessed Rarity: ${guessedRarity.Name})`;
    }
}

function compareExpansionDates(guessedExpansion, secretExpansion) {
    const guessedDate = new Date(guessedExpansion.ReleaseDate);
    const secretDate = new Date(secretExpansion.ReleaseDate);
	const expac = guessedExpansion.Expansion;
    if (guessedDate.getTime() > secretDate.getTime()) {
        return "⬇️ Older! (Guessed Expansion: "+expac+")";
    } else if (guessedDate.getTime() < secretDate.getTime()) {
        return "⬆️ Newer! (Guessed Expansion: "+expac+")";
    } else {
        return "✅ Same release date! (Guessed Expansion: "+expac+")";
    }
}

function compareNumbers(guessedValue, secretValue, attributeName) {
    if (guessedValue > secretValue) {
        return `⬇️ Lower!`;
    } else if (guessedValue < secretValue) {
        return `⬆️ Higher!`;
    } else {
        return `✅ Correct!`;
    }
}

function disableSubmitButton() {
    const submitButton = document.getElementById("submitBtn");
    submitButton.disabled = true;
}

document.getElementById("darkModeToggle").addEventListener("click", function() {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

window.onload = function() {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
};
