/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

document.addEventListener('DOMContentLoaded', () => {
  const iconSection = document.querySelector('.icon-section') as HTMLElement | null;

  if (iconSection) {
    const handleClick = () => {
      alert('Haz clic en el icono para descargar la infografía.\n(Funcionalidad de descarga no implementada en este ejemplo)');
      
      // Example of how a download could be triggered:
      // const link = document.createElement('a');
      // link.href = 'path/to/your/infografia.pdf'; // Replace with actual file path
      // link.download = 'infografia.pdf';
      // document.body.appendChild(link);
      // link.click();
      // document.body.removeChild(link);
    };

    iconSection.addEventListener('click', handleClick);

    iconSection.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault(); // Prevent default space scroll or enter submit
        handleClick();
      }
    });
  }
});
