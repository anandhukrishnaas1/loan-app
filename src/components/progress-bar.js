/**
 * Progress Bar Component
 * Renders a horizontal stepper with clickable completed steps
 */

export function createProgressBar(steps, currentStep, onStepClick) {
  const container = document.createElement('div');
  container.className = 'progress-container';

  const stepsEl = document.createElement('div');
  stepsEl.className = 'progress-steps';
  stepsEl.setAttribute('role', 'navigation');
  stepsEl.setAttribute('aria-label', 'Progress');

  steps.forEach((step, index) => {
    if (index > 0) {
      const connector = document.createElement('div');
      connector.className = 'progress-connector';
      if (index < currentStep) {
        connector.classList.add('completed');
      } else if (index === currentStep) {
        connector.classList.add('active');
      }
      stepsEl.appendChild(connector);
    }

    const stepEl = document.createElement('div');
    stepEl.className = 'progress-step';
    stepEl.dataset.step = index;

    if (index === currentStep) {
      stepEl.classList.add('active');
      stepEl.setAttribute('aria-current', 'step');
    } else if (index < currentStep) {
      stepEl.classList.add('completed', 'clickable');
      stepEl.addEventListener('click', () => onStepClick(index));
      stepEl.setAttribute('role', 'button');
      stepEl.setAttribute('tabindex', '0');
      stepEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStepClick(index);
        }
      });
    }

    const circle = document.createElement('div');
    circle.className = 'progress-step-circle';

    const number = document.createElement('span');
    number.className = 'progress-step-number';
    number.textContent = index + 1;
    circle.appendChild(number);

    const label = document.createElement('span');
    label.className = 'progress-step-label';
    label.textContent = step.shortLabel || step.label;

    stepEl.appendChild(circle);
    stepEl.appendChild(label);
    stepsEl.appendChild(stepEl);
  });

  container.appendChild(stepsEl);
  return container;
}

/**
 * Update the progress bar for the current step
 */
export function updateProgressBar(container, currentStep) {
  const steps = container.querySelectorAll('.progress-step');
  const connectors = container.querySelectorAll('.progress-connector');

  steps.forEach((step, index) => {
    step.classList.remove('active', 'completed', 'clickable');
    step.removeAttribute('aria-current');

    if (index === currentStep) {
      step.classList.add('active');
      step.setAttribute('aria-current', 'step');
    } else if (index < currentStep) {
      step.classList.add('completed', 'clickable');
    }
  });

  connectors.forEach((conn, index) => {
    conn.classList.remove('completed', 'active');
    if (index + 1 < currentStep) {
      conn.classList.add('completed');
    } else if (index + 1 === currentStep) {
      conn.classList.add('active');
    }
  });
}
