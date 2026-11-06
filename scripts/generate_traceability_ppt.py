import os
from pptx import Presentation
from pptx.util import Inches

from ppt_builder.slides_intro import (
    build_slide_1_cover,
    build_slide_2_summary
)
from ppt_builder.slides_architecture import (
    build_slide_3_architecture
)
from ppt_builder.slides_flowcharts_prod import (
    build_slide_4_physical_flowchart,
    build_slide_5_backward_trace_engine,
    build_slide_6_forward_containment
)
from ppt_builder.slides_flowcharts_system import (
    build_slide_7_data_ingestion_flowchart,
    build_slide_8_qa_gateway_flowchart
)
from ppt_builder.slides_erd_production import (
    build_slide_9_erd_production
)
from ppt_builder.slides_erd_qc import (
    build_slide_10_erd_qc_part1,
    build_slide_11_erd_qc_part2
)
from ppt_builder.slides_erd_pa_security import (
    build_slide_12_erd_pa,
    build_slide_13_erd_security
)
from ppt_builder.slides_erd_topology import (
    build_slide_14_relational_topology
)
from ppt_builder.slides_compliance import (
    build_slide_15_audit_pras,
    build_slide_16_ui_dashboard
)
from ppt_builder.slides_closing import (
    build_slide_17_roadmap,
    build_slide_18_conclusion
)

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    builders = [
        build_slide_1_cover,
        build_slide_2_summary,
        build_slide_3_architecture,
        build_slide_4_physical_flowchart,
        build_slide_5_backward_trace_engine,
        build_slide_6_forward_containment,
        build_slide_7_data_ingestion_flowchart,
        build_slide_8_qa_gateway_flowchart,
        build_slide_9_erd_production,
        build_slide_10_erd_qc_part1,
        build_slide_11_erd_qc_part2,
        build_slide_12_erd_pa,
        build_slide_13_erd_security,
        build_slide_14_relational_topology,
        build_slide_15_audit_pras,
        build_slide_16_ui_dashboard,
        build_slide_17_roadmap,
        build_slide_18_conclusion
    ]

    for builder in builders:
        slide = prs.slides.add_slide(blank_layout)
        builder(slide)

    out_filename = "Traceability_PT_Santos_Jaya_Abadi.pptx"
    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", out_filename))
    prs.save(out_path)
    print(f"[SUCCESS] Master Presentation generated successfully: {out_path}")
    print(f"[METRICS] Total Slides: {len(prs.slides)}")
    return out_path

if __name__ == "__main__":
    create_presentation()
