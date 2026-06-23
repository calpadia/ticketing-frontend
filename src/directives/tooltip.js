export default {
  mounted(el, binding) {
    el._tooltipValue = binding.value;

    const tooltip = document.createElement('div');
    tooltip.className = 'fixed z-[9999] px-2.5 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg pointer-events-none transition-all duration-200 opacity-0 scale-95 flex items-center justify-center';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'relative z-10';
    textSpan.textContent = el._tooltipValue || '';
    tooltip.appendChild(textSpan);
    
    const arrow = document.createElement('div');
    arrow.className = 'absolute w-2 h-2 bg-gray-900 rotate-45';
    tooltip.appendChild(arrow);
    
    el._tooltipElement = tooltip;
    el._tooltipText = textSpan;
    
    el._handleMouseEnter = () => {
      if (!el._tooltipValue) return;
      document.body.appendChild(tooltip);
      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        
        let shift = 0;
        if (left < 8) {
          shift = 8 - left;
          left = 8;
        } else if (left + tooltipRect.width > window.innerWidth - 8) {
          shift = (window.innerWidth - 8) - (left + tooltipRect.width);
          left = window.innerWidth - 8 - tooltipRect.width;
        }

        arrow.style.bottom = '-4px';
        arrow.style.top = 'auto';
        arrow.style.left = `calc(50% - 4px - ${shift}px)`;
        
        if (top < 0) { 
          top = rect.bottom + 8;
          arrow.style.bottom = 'auto';
          arrow.style.top = '-4px';
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'scale(1)';
      });
    };
    
    el._handleMouseLeave = () => {
      tooltip.style.opacity = '0';
      tooltip.style.transform = 'scale(0.95)';
      setTimeout(() => {
        if (tooltip.parentNode) document.body.removeChild(tooltip);
      }, 200);
    };
    
    el.addEventListener('mouseenter', el._handleMouseEnter);
    el.addEventListener('mouseleave', el._handleMouseLeave);
  },
  updated(el, binding) {
    el._tooltipValue = binding.value;
    if (el._tooltipText && binding.value) {
      el._tooltipText.textContent = binding.value;
    }
  },
  unmounted(el) {
    if (el._handleMouseEnter) el.removeEventListener('mouseenter', el._handleMouseEnter);
    if (el._handleMouseLeave) el.removeEventListener('mouseleave', el._handleMouseLeave);
    if (el._tooltipElement && el._tooltipElement.parentNode) {
      document.body.removeChild(el._tooltipElement);
    }
  }
}
