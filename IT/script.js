let cards = [];
let secretCard;
let attemptsLeft = 5;
let gameMode = "daily";
let endlessUsedCards = new Set();
let endlessWinStreak = 0;

fetch('cardsIT.json')
    .then(response => response.json())
    .then(data => {
        cards = data;

        selectDailyCard();
    })
    .catch(error => console.error("Error loading card data:", error));

document.getElementById("guessInput").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        checkGuess();
    }
});

const guessInput = document.getElementById("guessInput");
const suggestionsContainer = document.getElementById("suggestions");

let selectedSuggestion = -1;

guessInput.addEventListener("input", function() {
    const query = guessInput.value.trim().toLowerCase();

    suggestionsContainer.innerHTML = "";
    selectedSuggestion = -1;

    if (!query || cards.length === 0) {
        suggestionsContainer.style.display = "none";
        return;
    }

    const matches = cards
        .filter(card => card.Name.toLowerCase().includes(query))
        .slice(0, 8);

    if (matches.length === 0) {
        suggestionsContainer.style.display = "none";
        return;
    }

    matches.forEach((card, index) => {
        const suggestion = document.createElement("div");

        suggestion.classList.add("suggestion-item");
        suggestion.innerText = card.Name;

        suggestion.addEventListener("click", function() {
            guessInput.value = card.Name;
            suggestionsContainer.style.display = "none";
            selectedSuggestion = -1;
        });

        suggestionsContainer.appendChild(suggestion);
    });

    suggestionsContainer.style.display = "block";
});

guessInput.addEventListener("keydown", function(event) {
    const suggestions = suggestionsContainer.querySelectorAll(".suggestion-item");

    if (suggestions.length === 0) {
        return;
    }

    if (event.key === "ArrowDown") {
        event.preventDefault();

        selectedSuggestion++;

        if (selectedSuggestion >= suggestions.length) {
            selectedSuggestion = 0;
        }

        updateSelectedSuggestion(suggestions);
    }

    else if (event.key === "ArrowUp") {
        event.preventDefault();

        selectedSuggestion--;

        if (selectedSuggestion < 0) {
            selectedSuggestion = suggestions.length - 1;
        }

        updateSelectedSuggestion(suggestions);
    }

    else if (event.key === "Enter") {
        if (selectedSuggestion >= 0) {
            event.preventDefault();

            guessInput.value = suggestions[selectedSuggestion].innerText;
            suggestionsContainer.style.display = "none";
            selectedSuggestion = -1;
        }
    }

    else if (event.key === "Escape") {
        suggestionsContainer.style.display = "none";
        selectedSuggestion = -1;
    }
});

function selectEndlessCard() {
    if (cards.length === 0) {
        return;
    }

    if (endlessUsedCards.size >= cards.length) {
        endlessUsedCards.clear();
    }

    const availableCards = cards.filter(
        card => !endlessUsedCards.has(card.ID)
    );

    const randomIndex = Math.floor(
        Math.random() * availableCards.length
    );

    secretCard = availableCards[randomIndex];

    endlessUsedCards.add(secretCard.ID);
}

function selectDailyCard() {
    function randomSeed(seed) {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    const now = new Date();

    const dateSeed = parseInt(
        now.getFullYear().toString() +
        (now.getMonth() + 1).toString().padStart(2, '0') +
        now.getDate().toString().padStart(2, '0')
    );

    const randomIndex = Math.floor(
        randomSeed(dateSeed) * cards.length
    );

    secretCard = cards[randomIndex];
}

function updateSelectedSuggestion(suggestions) {
    suggestions.forEach(item => {
        item.classList.remove("selected-suggestion");
    });

    if (selectedSuggestion >= 0) {
        suggestions[selectedSuggestion].classList.add("selected-suggestion");
    }
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".guess-container")) {
        suggestionsContainer.style.display = "none";
        selectedSuggestion = -1;
    }
});

function startEndlessRound() {
    if (cards.length === 0) {
        return;
    }

    selectEndlessCard();

    attemptsLeft = 5;

    document.getElementById("attempts").innerText =
        "Attempts left: 5";

    document.getElementById("feedback").innerHTML = "";

    document.getElementById("hints").innerHTML = "";

    const guessInput = document.getElementById("guessInput");

    guessInput.value = "";
    guessInput.disabled = false;

    document.getElementById("submitBtn").disabled = false;

    document.getElementById("nextCardBtn").style.display = "none";

    updateStreakDisplay();
}

function updateStreakDisplay() {
    const streak = document.getElementById("streak");

    if (gameMode === "endless") {
        streak.style.display = "block";
        streak.innerText =
            `🔥 Win Streak: ${endlessWinStreak}`;
    } else {
        streak.style.display = "none";
    }
}

document.getElementById("dailyModeBtn").addEventListener("click", function() {
    if (gameMode === "daily") {
        return;
    }

    gameMode = "daily";

    selectDailyCard();

    attemptsLeft = 5;

    document.getElementById("attempts").innerText =
        "Attempts left: 5";

    document.getElementById("feedback").innerHTML = "";

    document.getElementById("hints").innerHTML = "";

    document.getElementById("guessInput").value = "";
    document.getElementById("guessInput").disabled = false;

    document.getElementById("submitBtn").disabled = false;

    document.getElementById("nextCardBtn").style.display = "none";

    document.getElementById("dailyModeBtn")
        .classList.add("active");

    document.getElementById("endlessModeBtn")
        .classList.remove("active");

    updateStreakDisplay();
});

document.getElementById("endlessModeBtn").addEventListener("click", function() {
    if (gameMode === "endless") {
        return;
    }

    gameMode = "endless";

    endlessWinStreak = 0;
    endlessUsedCards.clear();

    document.getElementById("dailyModeBtn")
        .classList.remove("active");

    document.getElementById("endlessModeBtn")
        .classList.add("active");

    startEndlessRound();
});

function checkGuess() {
	const follower = "Difensori";
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

    attemptsLeft--;
    attemptsDisplay.innerText = `Attempts left: ${attemptsLeft}`;

    if (guessedCard.Name === secretCard.Name) {
        feedback.innerHTML = `🎉 Correct! The answer was <a href="https://shadowverse-portal.com/card/${secretCard.ID}"><b>${secretCard.Name}</b></a>.`;
		disableSubmitButton();
        document.getElementById("guessInput").disabled = true;		
		if (gameMode === "endless") {
			endlessWinStreak++;
			updateStreakDisplay();
			document.getElementById("nextCardBtn").style.display = "inline-block";
		}
        return;
    } else {
		if (attemptsLeft <= 0) {
			feedback.innerHTML += `<br>💀 Game Over! The correct answer was <a href="https://shadowverse-portal.com/card/${secretCard.ID}"><b>${secretCard.Name}</b></a>.`;
			disableSubmitButton();
			document.getElementById("guessInput").disabled = true;
			if (gameMode === "endless") {
				endlessWinStreak = 0;
				updateStreakDisplay();
				document.getElementById("nextCardBtn").style.display = "inline-block";
			}
		}
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
