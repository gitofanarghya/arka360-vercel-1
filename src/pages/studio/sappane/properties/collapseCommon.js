/**
 * @Author : Vivek Yadav
 * @Date : 2020-12-28T05:11:18+06:30
 * @Email : vivek@thesolarlabs.com
 * @Last modified by : Vivek Yadav
 * @Last modified time : 2020-12-28T18:12:28+08:30
 * @param {String} divId 
 */

function collapseDiv(divId) {
    let coll = document.getElementsByClassName(divId);
        for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            let content = this.nextElementSibling;
            if (content.style.display === "block") {
            content.style.display = "none";
            } else {
            content.style.display = "block";
            }
        });
    }
}

export { collapseDiv };