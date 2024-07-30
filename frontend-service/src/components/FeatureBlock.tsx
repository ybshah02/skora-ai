interface FeatureBlockProps {
    big: boolean;
    imageUrl: string;
    title: string;
    description: string;
  }
  
  interface FeatureGridProps {
    blocksData: FeatureBlockProps[]; 
  }




function FeatureBlock({ big, imageUrl, title, description } : FeatureBlockProps) {
    if (window.innerWidth < 752) {
        big = false;
    }
    const blockClass = `feature-block ${big ? '' : 'small'}`;
    const style = {
        backgroundImage: `url(${imageUrl})`,
      };
    return (
        <div className={blockClass} style={style}>
          <div className="feature-block-gradient">
            <div className="feature-block-content">
              <div className="button-text">{title}</div>
              <h1 className="heading section-head white">{description}</h1>
            </div>
          </div>
        </div>
    )
}

function FeatureGrid({ blocksData }: FeatureGridProps) {
    let style = {}
    if (window.innerWidth < 752) {
      style = {
        gridTemplateColumns: '1fr'
      }
    }

    return (
      <section className="section">
      <div className="mid-section">
        <h1 className="heading section-head">Level up your game.</h1>
        <div className="grid-div" style={style}>
            {blocksData.map((block, index) => (
            <FeatureBlock
              key={index}
              big={block.big}
              imageUrl={block.imageUrl}
              title={block.title}
              description={block.description}
            />
          ))}
        </div>
      </div>
    </section>
    )
  }

export default FeatureGrid;