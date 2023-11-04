function convertCitationsToRanges() {
    // Find all citation elements
    var citationElements = document.querySelectorAll('.ltx_cite.ltx_citemacro_cite');

    citationElements.forEach(function(cite) {
        var citationLinks = cite.getElementsByTagName('a');
        var citationNumbers = Array.from(citationLinks).map(function(link) {
        return parseInt(link.textContent);
        });

        // Sort the citation numbers to ensure they are in order
        citationNumbers.sort(function(a, b) { return a - b; });

        // Initialize variables to track the ranges
        var ranges = [];
        var start = null, end = null;

        // Function to add range or single number to ranges array
        var addRange = function(start, end) {
        if (start !== null) {
            ranges.push((start === end || end === null) ? String(start) : start + '-' + end);
        }
        };

        // Iterate over the sorted citation numbers to find ranges
        for (var i = 0; i < citationNumbers.length; i++) {
        if (start === null) {
            start = citationNumbers[i];
            end = start;
        } else if (citationNumbers[i] === end + 1) {
            // If the current number is consecutive, extend the end of the current range
            end = citationNumbers[i];
        } else {
            // If not consecutive, add the current range and start a new range
            addRange(start, end);
            start = citationNumbers[i];
            end = start;
        }
        }
        // Add the final range
        addRange(start, end);

        // Now we have the ranges, we can reconstruct the citation HTML
        var newCitationHtml = ranges.map(function(range) {
        // This will need to be adapted to link to the correct references and popup logic
        return '<a href="#ref" class="ltx_ref range">' + range + '</a>';
        }).join(', ');

        // Replace the old citation HTML with the new range-based HTML
        cite.innerHTML = '[' + newCitationHtml + ']';
    });
}

function setupModalPopup() {
    /*
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('range')) {
            event.preventDefault();
            var rangeText = event.target.textContent;
            var rangeParts = rangeText.split('-');
            var start = parseInt(rangeParts[0]);
            var end = rangeParts.length > 1 ? parseInt(rangeParts[1]) : start;
            var citationLinksHtml = '';

            for (var i = start; i <= end; i++) {
                // Assuming the ids in the reference list are of the form 'bib.bibX'
                citationLinksHtml += '<a href="#bib.bib' + i + '">' + i + '</a>';
                if (i < end) {
                    citationLinksHtml += ', ';
                }
            }

            var modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = 'Citations for range: ' + citationLinksHtml;
            modalBody.innerHTML += '<br/><a href="#bib" class="go-to-references">Go to References</a>';

            var myModal = new bootstrap.Modal(document.getElementById('citationModal'));
            myModal.show();
        }
    });
    */
    var modal = document.getElementById('citationModal');
    var modalBody = modal.querySelector('.modal-body');
    var modalTrigger; // This will hold the button that triggered the modal

    function focusFirstElement() {
        var focusableElements = modal.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length) {
            focusableElements[0].focus();
        }
    }

    function trapTabKey(e) {
        var focusableElements = modal.querySelectorAll('a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
        var firstFocusableElement = focusableElements[0];
        var lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) /* shift + tab */ {
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else /* tab */ {
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    function closeModal() {
        modal.style.display = 'none';
        document.removeEventListener('keydown', trapTabKey);
        if (modalTrigger) {
            modalTrigger.focus(); // Set focus back to the triggering element
        }
    }

    function handleModalKeyDown(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('range')) {
            event.preventDefault();
            modalTrigger = event.target; // Save the trigger

            // ... existing code to populate modalBody ...
            //event.preventDefault();
            var rangeText = event.target.textContent;
            var rangeParts = rangeText.split('-');
            var start = parseInt(rangeParts[0]);
            var end = rangeParts.length > 1 ? parseInt(rangeParts[1]) : start;
            var citationLinksHtml = '';

            for (var i = start; i <= end; i++) {
                // Assuming the ids in the reference list are of the form 'bib.bibX'
                citationLinksHtml += '<a href="#bib.bib' + i + '">' + i + '</a>';
                if (i < end) {
                    citationLinksHtml += ', ';
                }
            }

            var modalBody = document.querySelector('.modal-body');
            modalBody.innerHTML = 'Citations for range: ' + citationLinksHtml;
            modalBody.innerHTML += '<br/><a href="#bib" class="go-to-references">Go to References</a>';

            var myModal = new bootstrap.Modal(document.getElementById('citationModal'));
            myModal.show();

            modal.setAttribute('aria-hidden', 'false');
            document.body.setAttribute('aria-hidden', 'true'); // Hide main content
            modal.style.display = 'block';
            focusFirstElement();
            modal.querySelector('.close').addEventListener('click', closeModal); // Assuming you have a close button
            document.addEventListener('keydown', handleModalKeyDown);
            modal.addEventListener('keydown', trapTabKey);
        }
    });

    modal.querySelector('.close').addEventListener('click', function() {
        modal.setAttribute('aria-hidden', 'true');
        document.body.removeAttribute('aria-hidden');
        closeModal();
    });
}

function assignNumbersToReferences() {
    // Select all the items in the reference section
    let bibItems = document.querySelectorAll('.ltx_biblist .ltx_bibitem');

    // Iterate through the items and assign numbers
    bibItems.forEach((item, index) => {
        let referenceSpan = item.querySelector('.ltx_tag.ltx_role_refnum.ltx_tag_bibitem');
        if (referenceSpan) {
            let numberSpan = document.createElement('span');
            numberSpan.innerText = `[${index + 1}] `;
            referenceSpan.insertBefore(numberSpan, referenceSpan.firstChild);
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    convertCitationsToRanges();
    setupModalPopup();
    assignNumbersToReferences();
});
