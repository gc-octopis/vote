const qsAll = (selector) => document.querySelectorAll(selector);
const id = (id) => document.getElementById(id);
const getBgColor = (element) => element.style.backgroundColor;
const setBgColor = (element, color) => element.style.backgroundColor = color;

class Vote
{
    constructor()
    {
        this.groupElements = [];
        this.getVoterFromJSON();

        this.agreeButton = id("agreeButton");
        this.curColor;
        this.flipAgree(this.agreeButton); // init to agree
        this.agreeButton.onclick = () => this.flipAgree(this.agreeButton);

        this.reset = id("reset");
        this.reset.onclick = () => { qsAll(".box").forEach(e => { setBgColor(e, ""); }); };

        this.copyButton = id("copyButton");
        this.copyButton.onclick = () => this.copy();
    }

    async getVoterFromJSON()
    {
        let json;

        // fetch data from voter.json (save your voter data at that location)
        await fetch('voter.json')
            .then(res => res.json())
            .then(j => json = j);

        for (let group of Object.keys(json))
        {
            // init group element
            let groupElement = document.createElement('div');
            groupElement.classList.add('group');
            groupElement.id = group;

            // add to DOM tree and array
            document.querySelector('.voters').appendChild(groupElement);
            this.groupElements.push(groupElement);

            // create voters of each group
            for (let voter of json[group])
            {
                // init voter (box) element
                let element = document.createElement("div");
                element.classList.add("box");
                element.id = voter.name;
                element.innerText = `${voter.class} ${voter.name}`;
                element.style.opacity = "50%"; // for the status of NOT ATTENDING

                // init checkbox to check if attended
                let checkBox = document.createElement("input");
                checkBox.type = "checkbox";

                // add to DOM tree
                element.appendChild(checkBox);
                groupElement.appendChild(element);

                element.onclick = () => this.vote(element);
                checkBox.onclick = () => {event.stopPropagation(); this.check(checkBox);};
            }

        }
    }

    flipAgree(agreeButton)
    {
        if (getBgColor(agreeButton) == "green")
        {
            agreeButton.innerText = "不同意";
            setBgColor(agreeButton, "red");
            this.curColor = "red";
        }
        else
        {
            agreeButton.innerText = "同意";
            setBgColor(agreeButton, "green");
            this.curColor = "green";
        }
    }

    copy()
    {
        let result = this.count();
        let data = `贊成者：${result.agree.join("、")}
反對者：${result.disagree.join("、")}
棄權者：${result.abstain.join("、")}`;
        navigator.clipboard.writeText(data);
    }

    vote(element)
    {

        if (element.querySelector('input').checked) // check if voter has attended
        {
            if (getBgColor(element) == this.curColor) setBgColor(element, ""); // work as cancel
            else setBgColor(element, this.curColor); // work as voting agree/disagree depending on curColor 
        }

        this.updateCounter();
    }

    count()
    {
        let agreeList = [];
        let disagreeList = [];
        let abstainList = [];
        qsAll(".box").forEach(e => {
            if (e.querySelector("input").checked)
            {
                if (getBgColor(e) == "green") agreeList.push(e.id);
                if (getBgColor(e) == "red") disagreeList.push(e.id);
                if (getBgColor(e) == "") abstainList.push(e.id);
            }
        });
    
        return {agree: agreeList, disagree: disagreeList, abstain: abstainList};
    }

    check(checkBox)
    {
        let element = checkBox.closest(".box");
    
        if (checkBox.checked)
        {
            element.style.opacity = "100%";
        }
        else
        {
            element.style.opacity = "50%";
            setBgColor(element, ""); // reset to neutral when unattended
        }

        this.updateCounter();
    }

    updateCounter()
    {
        let result = this.count();
        id("attend").innerText = `出席人數：${result.agree.length + result.disagree.length + result.abstain.length}`;
        id("agree").innerText = `贊成票數：${result.agree.length}`;
        id("disagree").innerText = `反對票數：${result.disagree.length}`;
    }
}

const vote = new Vote();