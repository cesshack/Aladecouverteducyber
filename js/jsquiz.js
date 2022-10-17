// DOM Variables
var ViewHighScoreEl = document.getElementById("view-high-scores");
var timerEl = document.getElementById("timer");
var startQuizContainerEl = document.getElementById("start-quiz-container");
var startButtonEl = document.getElementById("start-game");

var questionContainerEl = document.getElementById("question-container");
var questionDivEl = document.getElementById("question-div");
var questionTextEl = document.getElementById("qn-text");
var answerbuttonsEl = document.getElementById("answer-buttons");

var ansKeyContainerEl = document.getElementById("answer-key-container");
var rightAnswerEl = document.getElementById("right-ans");
var wrongAnswerEl = document.getElementById("wrong-ans");
var ansGoodEl = document.getElementById("ans-good");

var endQuizContainerEl = document.getElementById("end-quiz-container");
var finalScoreValueEl = document.getElementById("final-score-value");
var formSubmitScore = document.getElementById("submit-score-form");

var hiScoresContainerEl = document.getElementById("high-scores-container");
var listHighScoreEl = document.getElementById("high-score-list");
var btnGoBackEl = document.querySelector("#go-back")
var btnClearScoresEl = document.querySelector("#clear-high-scores")

// Global variables
const TIME_LIMIT = 350
var curQn = 0; // tracks the current question
var timeLeft = 0; // the time left in the quiz, starts at 120 seconds
const penalty = 10; // seconds penalized for wrong answers
var timerInterval = 0;
var gameOver = false;
var finalScore = 0;
var highScoresArray = [];
var quizQuestions = [];
var score = 0;

// check that question bank is loaded from questions.js
console.log(questionBank);

function initializeQuiz() {
  curQn = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = 0;
  gameOver = false;
  finalScore = 0;
  highScoresArray = [];
  loadHighScore();

  quizQuestions = shuffle(questionBank).slice(0, 20);
  console.log(quizQuestions);
}

function startQuiz() {
  // Initialize, start the clock, then show the first quiz question
  initializeQuiz();
  showElement(startQuizContainerEl, false);
  startTimer();
  resetQuestionContainer();
  displayQuestion(curQn);
}

// Displays the question and answer choices from the quizQuestions array at the given index
var displayQuestion = function (index) {
  questionTextEl.innerText = "" + (index + 1) + ". " + quizQuestions[index].qn;
  var answerbutton;
  for (var i = 0; i < quizQuestions[index].choices.length; i++) {
    answerbutton = document.createElement("button");
    answerbutton.innerText = quizQuestions[index].choices[i];
    answerbutton.classList.add("btn");
    answerbutton.classList.add("answerbtn");
    answerbutton.addEventListener("click", checkAnswer);
    answerbuttonsEl.appendChild(answerbutton);
  }
  showElement(questionContainerEl, true);
};

//check if answer is correct
var checkAnswer = function (event) {
  var selectedAnswer = event.target.innerText;
  var goodAnswer = quizQuestions[curQn].choices[quizQuestions[curQn].ans];
  console.log("selected answer = " + selectedAnswer);
  console.log("correct answer = " + goodAnswer);


  // if the right answer was chosen show the correct answer message on the screen,
  // else show the wrong answer message. If the answer was wrong apply the time penalty as well.
  if (selectedAnswer === goodAnswer) {
    console.log("Correct answer chosen!!");
    showAnswerRightOrWrongMessage(curQn, true);
  } else {
    console.log("Wrong answer chosen!!");
    showAnswerRightOrWrongMessage(curQn, false);
    applyPenalty();
  }

  // If we are more questions left, show the next question, else show the final score.
  curQn++;
  if (curQn < quizQuestions.length) {
    resetQuestionContainer();
    displayQuestion(curQn);
  } else {
    gameOver = true;
    finalScore = timeLeft;

    // show the scores container
    showEndQuizContainer(score);
  }
};

// to show the start quiz container.
function showStartQuizContainer() {

  // hide all the other containers.
  showElement(questionContainerEl, false);
  showElement(ansKeyContainerEl, false);
  showElement(hiScoresContainerEl, false);
  showElement(endQuizContainerEl, false);

  // show the start-quiz-container
  showElement(startQuizContainerEl, true);
}

// to show the final score and allow the user to submit it to the high scores.
function showEndQuizContainer(finalScore) {
  // show the final score (which is the time left)
  finalScoreValueEl.innerHTML = " " + finalScore;

  // hide all the other containers.
  showElement(startQuizContainerEl, false);
  showElement(questionContainerEl, false);
  showElement(ansKeyContainerEl, false);
  showElement(hiScoresContainerEl, false);

  // show the hi-scores-container
  showElement(endQuizContainerEl, true);
}

//create high score values
var saveHighScore = function (event) {
  event.preventDefault();
  var initials = document.querySelector("#initials").value;
  if (!initials) {
    alert("Enter your intials!");
    return;
  }

  // reset the form
  formSubmitScore.reset();

  // add the final score to the High scores array with the users initials
  addToHighScores(initials, finalScore);

  // save the high scores to local storage
  saveHighScoresToLocalStorage(highScoresArray);

  // create the list elements to show the high scores
  setupHighScoresContainer(highScoresArray);

  // show the high scores container
  showHighScoresContainer();
};

function viewHighScores() {
    console.log("In viewHighScores " + highScoresArray);

    // create the list elements to show the high scores
    setupHighScoresContainer(highScoresArray);

    // show the high scores container
    showHighScoresContainer();
}

var clearHighScores = function (event) {
  event.preventDefault();
  localStorage.clear();
  clearHighScoresList();
  initializeQuiz();
  timerEl.textContent = TIME_LIMIT;
}

//clear all high scores list items
function clearHighScoresList() {
  while (listHighScoreEl.firstChild) {
    listHighScoreEl.removeChild(listHighScoreEl.firstChild);
  }
}

function setupHighScoresContainer(hiScrArr) {
  // if there are highscore list items, clear them
  clearHighScoresList();

  // create elements in order of high scores
  // the hiScrArr should already be setup in desc order
  for (var i = 0; i < hiScrArr.length; i++) {
    var highscoreEl = document.createElement("li");
    highscoreEl.ClassName = "high-score";
    highscoreEl.innerHTML = hiScrArr[i].userName + " - " + hiScrArr[i].score;
    listHighScoreEl.appendChild(highscoreEl);
  }
}

function showHighScoresContainer() {
  // hide all the other containers.
  showElement(startQuizContainerEl, false);
  showElement(questionContainerEl, false);
  showElement(ansKeyContainerEl, false);
  showElement(endQuizContainerEl, false);

  // show only the high-scores-container
  showElement(hiScoresContainerEl, true);
}

// helper function to create the Array of highscores and keep it sorted
function addToHighScores(initials, finScore) {
  var lastHighScoreAdded = {
    userName: initials,
    score: finScore,
  };

  //push high score into highScoresArray.
  highScoresArray.push(lastHighScoreAdded);

  // Sort highScoresArray in descending order of high scores
  highScoresArray.sort((a, b) => {
    return b.score - a.score;
  });

  return lastHighScoreAdded;
}

//save high scores to local storage
function saveHighScoresToLocalStorage(hiScAr) {
  localStorage.setItem("HighScores", JSON.stringify(hiScAr));
}


function loadHighScore() {
  var loadedHighScores = localStorage.getItem("HighScores")
      if (!loadedHighScores) {
      return;
  }

  highScoresArray = JSON.parse(loadedHighScores);
  console.log('loaded high scores from local storage: ', highScoresArray);

  // Sort highScoresArray in descending order of high scores
  highScoresArray.sort((a, b) => {
    return b.score - a.score;
  });
}

// before showing the next question, ensure that the buttons for the previous questions are removed.
function resetQuestionContainer() {
  questionTextEl.innerText = "";
  while (answerbuttonsEl.firstChild) {
    answerbuttonsEl.removeChild(answerbuttonsEl.firstChild);
  }
}

// to show if the previous question's answer was "Correct" or "Wrong"
function showAnswerRightOrWrongMessage(qnIdx, booleanRight) {
  if (booleanRight) {
    ansGoodEl.innerHTML = "" + (qnIdx + 1) + ". " + "Correcte &#9989";
    showElement(ansKeyContainerEl, true);
	score = score + 10;
  } else {
    ansGoodEl.innerHTML = "" + (qnIdx + 1) + ". " + "Mauvaise réponse &#10060";
    showElement(ansKeyContainerEl, true);
  }
}

// penalty for a wrong answer is to reduce 10 seconds from the clock.
function applyPenalty() {
  timeLeft = timeLeft - penalty;
  if (timeLeft <= 0) {
    timeLeft = 0;
  }
}

// To show/hide the element - call showElement(el, true) - to show.
// Add the class "show" or "hide" to the element as specified by booleanShow
function showElement(elt, booleanShow) {
  // remove both classes if present, this ensures that only one of "show" or "hide" gets added to the classList.
  if (elt.classList.contains("show")) {
    elt.classList.remove("show");
  }
  if (elt.classList.contains("hide")) {
    elt.classList.remove("hide");
  }

  // if booleanShow = true, add the class 'show' else add the class 'hide'
  if (booleanShow) {
    elt.classList.add("show");
  } else {
    elt.classList.add("hide");
  }
}

// displays the time left in the timer element
function showTimeLeft() {
  if (gameOver || timeLeft <= 0) {
    stopTimer();
  }
  timerEl.textContent = timeLeft;
  timeLeft--;
}

// to stop the timer at the end of the quiz
function stopTimer() {
  clearInterval(timerInterval);
}

// Updates the countdown timer on the screen.
function startTimer() {
  timerInterval = setInterval(showTimeLeft, 1000);
}

/* ----- Event Listeners --------- */

// To start the quiz
startButtonEl.addEventListener("click", startQuiz);

// When the for submit button is clicked on the submit-score form
formSubmitScore.addEventListener("submit", saveHighScore);

//when view high-scores is clicked
ViewHighScoreEl.addEventListener("click", viewHighScores);

//Go back button
btnGoBackEl.addEventListener("click", showStartQuizContainer);

//clear scores button
btnClearScoresEl.addEventListener("click", clearHighScores)


/* ------------ Utility Functions  ------------- */

// Function to shuffle an array using the Knuth Shuffle method.
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}