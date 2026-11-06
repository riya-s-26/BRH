/**
 * BRIDES RIGHT HAND — Contact & Inquire Page Logic
 * Handles client-side validation, accessibility, smooth anchor navigation,
 * and reliable form submission state lifecycle management.
 */

(function () {
    'use strict';

    /**
     * FORM ENDPOINT CONFIGURATION
     * 
     * To connect an approved third-party form handler (e.g. Formspree, Netlify Forms, Formkeep)
     * or a custom serverless endpoint, assign the verified URL below:
     * e.g., const FORM_ENDPOINT = 'https://formspree.io/f/your_form_id';
     * 
     * When empty (''), client-side validation runs fully, prevents unapproved third-party data leakage,
     * preserves all user input, and provides a direct, pre-filled mailto transmission option.
     */
    const FORM_ENDPOINT = '';

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Elements
    const form = document.getElementById('brh-inquiry-form');
    const submitBtn = document.getElementById('submit-btn');
    const statusBanner = document.getElementById('form-status');
    const dateUndecidedCheckbox = document.getElementById('dateUndecided');
    const eventDateInput = document.getElementById('eventDate');

    // Smooth scroll offset for sticky header
    const HEADER_OFFSET = 100;

    // State Lifecycle Management
    const FormState = {
        IDLE: 'idle',
        VALIDATING: 'validating',
        SUBMITTING: 'submitting',
        SUCCESS: 'success',
        ERROR: 'error'
    };
    let currentFormState = FormState.IDLE;
    let isSubmitting = false;

    /**
     * Updates the submit button and spinner according to the formal state lifecycle:
     * idle -> validating -> submitting -> success / error -> idle
     */
    function setSubmitButtonState(state) {
        currentFormState = state;
        const btnText = submitBtn ? (submitBtn.querySelector('.btn-text') || submitBtn) : null;
        const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

        if (state === FormState.SUBMITTING) {
            isSubmitting = true;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('is-loading');
                submitBtn.setAttribute('aria-busy', 'true');
            }
            if (btnText) {
                btnText.textContent = 'SUBMITTING INQUIRY...';
            }
            if (btnSpinner) {
                btnSpinner.classList.add('is-active');
                btnSpinner.removeAttribute('hidden');
                btnSpinner.style.setProperty('display', 'inline-block', 'important');
            }
        } else if (state === FormState.SUCCESS) {
            isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-busy');
            }
            if (btnText) {
                btnText.textContent = 'INQUIRY SENT ✓';
            }
            if (btnSpinner) {
                btnSpinner.classList.remove('is-active');
                btnSpinner.setAttribute('hidden', '');
                btnSpinner.style.setProperty('display', 'none', 'important');
            }
        } else {
            // IDLE, VALIDATING, or ERROR: Always restore to ready state
            isSubmitting = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
                submitBtn.removeAttribute('aria-busy');
            }
            if (btnText) {
                btnText.textContent = 'SUBMIT INQUIRY';
            }
            if (btnSpinner) {
                btnSpinner.classList.remove('is-active');
                btnSpinner.setAttribute('hidden', '');
                btnSpinner.style.setProperty('display', 'none', 'important');
            }
        }
    }

    // Initialize button state immediately
    setSubmitButtonState(FormState.IDLE);

    function smoothScrollTo(element) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const targetY = window.pageYOffset + rect.top - HEADER_OFFSET;
        window.scrollTo({
            top: targetY,
            behavior: reducedMotion ? 'instant' : 'smooth'
        });
    }

    // Attach smooth scroll to form triggers
    document.querySelectorAll('.js-scroll-to-form').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const target = document.getElementById('inquiry-form');
            if (target) {
                smoothScrollTo(target);
                // Set focus to the first input after scrolling for accessibility
                const firstInput = document.getElementById('fullName');
                if (firstInput) {
                    setTimeout(() => firstInput.focus({ preventScroll: true }), 400);
                }
            }
        });
    });

    // Date "Undecided" toggle behavior
    if (dateUndecidedCheckbox && eventDateInput) {
        dateUndecidedCheckbox.addEventListener('change', () => {
            if (dateUndecidedCheckbox.checked) {
                eventDateInput.value = '';
                eventDateInput.disabled = true;
                eventDateInput.style.opacity = '0.55';
            } else {
                eventDateInput.disabled = false;
                eventDateInput.style.opacity = '1';
                eventDateInput.focus();
            }
        });
    }

    // Field validation helper
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
    }

    function setFieldError(fieldId, errorId, isInvalid) {
        const field = document.getElementById(fieldId);
        const errorMsg = document.getElementById(errorId);
        if (!field || !errorMsg) return;

        if (isInvalid) {
            field.setAttribute('aria-invalid', 'true');
            errorMsg.style.display = 'block';
        } else {
            field.removeAttribute('aria-invalid');
            errorMsg.style.display = 'none';
        }
    }

    function getSelectedServices() {
        if (!form) return [];
        const checked = form.querySelectorAll('input[name="services"]:checked');
        return Array.from(checked).map(cb => cb.value);
    }

    function validateForm() {
        let isValid = true;
        let firstInvalidField = null;

        // 1. Full Name (required)
        const fullName = document.getElementById('fullName');
        const isNameValid = fullName && fullName.value.trim().length >= 2;
        setFieldError('fullName', 'fullName-error', !isNameValid);
        if (!isNameValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = fullName;
        }

        // 2. Email Address (required & valid format)
        const email = document.getElementById('email');
        const isEmailValid = email && validateEmail(email.value);
        setFieldError('email', 'email-error', !isEmailValid);
        if (!isEmailValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = email;
        }

        // 3. Event Type (required)
        const eventType = document.getElementById('eventType');
        const isEventTypeValid = eventType && eventType.value.trim().length > 0;
        setFieldError('eventType', 'eventType-error', !isEventTypeValid);
        if (!isEventTypeValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = eventType;
        }

        // 4. Services of Interest (required: at least one)
        const selectedServices = getSelectedServices();
        const servicesError = document.getElementById('services-error');
        const isServicesValid = selectedServices.length > 0;
        if (servicesError) {
            servicesError.style.display = isServicesValid ? 'none' : 'block';
        }
        if (!isServicesValid) {
            isValid = false;
            if (!firstInvalidField && form) {
                firstInvalidField = form.querySelector('input[name="services"]');
            }
        }

        // 5. Vision / Details (required: at least 5 chars)
        const vision = document.getElementById('vision');
        const isVisionValid = vision && vision.value.trim().length >= 5;
        setFieldError('vision', 'vision-error', !isVisionValid);
        if (!isVisionValid) {
            isValid = false;
            if (!firstInvalidField) firstInvalidField = vision;
        }

        return { isValid, firstInvalidField };
    }

    // Attach realtime clearance of errors on user input
    ['fullName', 'email', 'eventType', 'vision'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (el.getAttribute('aria-invalid') === 'true') {
                    setFieldError(id, `${id}-error`, false);
                }
            });
            el.addEventListener('change', () => {
                if (el.getAttribute('aria-invalid') === 'true') {
                    setFieldError(id, `${id}-error`, false);
                }
            });
        }
    });

    if (form) {
        form.querySelectorAll('input[name="services"]').forEach(cb => {
            cb.addEventListener('change', () => {
                const servicesError = document.getElementById('services-error');
                if (servicesError && getSelectedServices().length > 0) {
                    servicesError.style.display = 'none';
                }
            });
        });
    }

    // Generate pre-filled mailto URL with inquiry details
    function generateMailtoUrl(formData) {
        const subject = encodeURIComponent(`[Wedding Inquiry] ${formData.fullName} — Brides Right Hand`);
        const bodyLines = [
            `INQUIRY FOR BRIDES RIGHT HAND:`,
            `-------------------------------------------`,
            `Your Name: ${formData.fullName}`,
            `Partner's Name: ${formData.partnerName || 'Not specified'}`,
            `Email: ${formData.email}`,
            `Phone: ${formData.phone || 'Not specified'}`,
            `Event Type: ${formData.eventType}`,
            `Event Date: ${formData.dateUndecided ? 'Date undecided / flexible' : (formData.eventDate || 'Not specified')}`,
            `Date Flexibility: ${formData.dateFlexibility || 'Not specified'}`,
            `Location / Venue: ${formData.location || 'Not specified'}`,
            `Estimated Guest Count: ${formData.guestCount || 'Not specified'}`,
            `Services of Interest: ${formData.services.join(', ')}`,
            `-------------------------------------------`,
            `Celebration Vision & Details:`,
            formData.vision,
            `-------------------------------------------`
        ];
        return `mailto:bridesrighthand94@gmail.com?subject=${subject}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    }

    // Form submission event
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Prevent duplicate clicks while a submission is already processing
            if (isSubmitting) return;

            // Clear existing status banner
            if (statusBanner) {
                statusBanner.hidden = true;
                statusBanner.className = 'form-status';
                statusBanner.innerHTML = '';
            }

            // Run validation
            const { isValid, firstInvalidField } = validateForm();

            // Failure path 1: Validation fails -> NEVER enter submitting state
            if (!isValid) {
                setSubmitButtonState(FormState.IDLE);

                if (statusBanner) {
                    statusBanner.hidden = false;
                    statusBanner.className = 'form-status status-error';
                    statusBanner.innerHTML = `
                        <p class="status-title">Please complete the required fields highlighted below.</p>
                        <p class="status-desc">We need your name, a valid email address, event type, selected services, and a brief description of your vision to prepare for our conversation.</p>
                    `;
                    smoothScrollTo(statusBanner);
                }
                if (firstInvalidField) {
                    firstInvalidField.focus();
                }
                return;
            }

            // Validation passed -> Enter submitting state
            setSubmitButtonState(FormState.SUBMITTING);

            // Gather values
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                partnerName: document.getElementById('partnerName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                eventType: document.getElementById('eventType').value,
                eventDate: document.getElementById('eventDate').value,
                dateUndecided: dateUndecidedCheckbox ? dateUndecidedCheckbox.checked : false,
                dateFlexibility: document.getElementById('dateFlexibility').value,
                location: document.getElementById('location').value.trim(),
                guestCount: document.getElementById('guestCount').value,
                services: getSelectedServices(),
                vision: document.getElementById('vision').value.trim()
            };

            // Scenario A: Configured Backend Endpoint
            if (FORM_ENDPOINT && FORM_ENDPOINT.trim().length > 0) {
                const abortController = new AbortController();
                const timeoutId = setTimeout(() => abortController.abort(), 12000); // 12-second safety timeout

                try {
                    const response = await fetch(FORM_ENDPOINT, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(formData),
                        signal: abortController.signal
                    });
                    clearTimeout(timeoutId);

                    if (response.ok) {
                        // Genuine server confirmation
                        setSubmitButtonState(FormState.SUCCESS);
                        form.hidden = true;
                        if (statusBanner) {
                            statusBanner.hidden = false;
                            statusBanner.className = 'form-status status-success';
                            statusBanner.innerHTML = `
                                <div class="status-icon" aria-hidden="true">✓</div>
                                <h3 class="status-title">Thank you for sharing your vision.</h3>
                                <p class="status-desc">Your inquiry has been submitted. Christina will review your celebration details and connect with you shortly to begin our conversation.</p>
                                <p class="status-note">If you have immediate questions, feel free to reach out directly at <a href="mailto:bridesrighthand94@gmail.com">bridesrighthand94@gmail.com</a> or <a href="tel:+16179014075">(617) 901-4075</a>.</p>
                            `;
                            smoothScrollTo(statusBanner);
                        }
                        return;
                    } else {
                        throw new Error(`Server responded with status ${response.status}`);
                    }
                } catch (err) {
                    clearTimeout(timeoutId);
                    console.error('Submission error:', err);
                    setSubmitButtonState(FormState.ERROR);

                    if (statusBanner) {
                        const mailtoFallback = generateMailtoUrl(formData);
                        statusBanner.hidden = false;
                        statusBanner.className = 'form-status status-error';
                        statusBanner.innerHTML = `
                            <p class="status-title">We were unable to submit your inquiry automatically.</p>
                            <p class="status-desc">All entered information has been safely preserved above. You can retry submitting, or send your details directly via email to Christina with one click:</p>
                            <div class="status-actions">
                                <a class="button dark status-action-btn" href="${mailtoFallback}">OPEN PRE-FILLED EMAIL DRAFT</a>
                                <a class="button light status-action-btn" href="tel:+16179014075">CALL (617) 901-4075</a>
                            </div>
                            <p class="status-note">Direct email: <a href="mailto:bridesrighthand94@gmail.com">bridesrighthand94@gmail.com</a></p>
                        `;
                        smoothScrollTo(statusBanner);
                    }
                }
            } 
            // Scenario B: Unconfigured Endpoint / Mailto Fallback
            else {
                // Immediately exit submitting state: NEVER leave an asynchronous spinner running for mailto
                setSubmitButtonState(FormState.IDLE);

                const mailtoFallback = generateMailtoUrl(formData);

                // Attempt to launch the visitor's mail client
                try {
                    window.location.href = mailtoFallback;
                } catch (e) {
                    console.warn('Could not launch mail client automatically:', e);
                }

                // Display clear, honest instructions to the user
                if (statusBanner) {
                    statusBanner.hidden = false;
                    statusBanner.className = 'form-status status-info';
                    statusBanner.innerHTML = `
                        <div class="status-icon" aria-hidden="true">✉</div>
                        <h3 class="status-title">Your Email Draft is Ready to Send</h3>
                        <p class="status-desc">All required fields have been validated and formatted into an email draft addressed to <strong>bridesrighthand94@gmail.com</strong>. Please check your email client and click <strong>Send</strong> to deliver your inquiry.</p>
                        <div class="status-actions">
                            <a class="button dark status-action-btn" href="${mailtoFallback}">OPEN EMAIL DRAFT AGAIN</a>
                            <a class="button light status-action-btn" href="tel:+16179014075">CALL (617) 901-4075</a>
                        </div>
                        <p class="status-note">All your entries remain safely preserved in the form above if you wish to make any adjustments.</p>
                    `;
                    smoothScrollTo(statusBanner);
                }
            }
        });
    }

    // Set current year in footer
    const yearEl = document.getElementById('year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
})();
