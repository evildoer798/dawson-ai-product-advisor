from pathlib import Path
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(r"D:\中东短剧")
OUT = ROOT / "output" / "docx"
OUT.mkdir(parents=True, exist_ok=True)

NAVY = "17324D"
BLUE = "2C6E9B"
LIGHT_BLUE = "EAF2F8"
LIGHT_GRAY = "F5F7F9"
MID_GRAY = "D9E0E6"
TEXT = "202B36"
MUTED = "5B6873"
GREEN = "EAF5EE"
YELLOW = "FFF5D9"
RED = "FDECEC"

def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)

def set_cell_border(cell, color=MID_GRAY, size="6"):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = "w:" + edge
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)

def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn("w:" + m))
        if node is None:
            node = OxmlElement("w:" + m)
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")

def mark_header_row(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = tr_pr.find(qn("w:tblHeader"))
    if tbl_header is None:
        tbl_header = OxmlElement("w:tblHeader")
        tr_pr.append(tbl_header)
    tbl_header.set(qn("w:val"), "true")

def set_run_font(run, name="Microsoft YaHei", size=None, color=TEXT, bold=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    if size:
        run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold

def setup_doc(title):
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = Inches(0.62)
    sec.bottom_margin = Inches(0.62)
    sec.left_margin = Inches(0.72)
    sec.right_margin = Inches(0.72)
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(9.5)
    normal.font.color.rgb = RGBColor.from_string(TEXT)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.18
    for style_name, size, color, before, after in [
        ("Title", 22, "000000", 0, 18),
        ("Heading 1", 15, "000000", 16, 8),
        ("Heading 2", 11.5, "000000", 10, 5),
        ("Heading 3", 10, NAVY, 7, 3),
    ]:
        style = styles[style_name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(size)
        style.font.color.rgb = RGBColor.from_string(color)
        style.font.bold = True
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True
    footer = sec.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p.add_run("DAWSEN AI  ·  内部项目文档")
    set_run_font(r, size=8, color=MUTED)
    return doc

def add_title(doc, title, subtitle):
    p = doc.add_paragraph(style="Title")
    r = p.add_run(title)
    set_run_font(r, size=22, color="000000", bold=True)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(18)
    r = p.add_run(subtitle)
    set_run_font(r, size=10.5, color=MUTED)

def add_intro(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run(text)
    set_run_font(r, size=10, color=TEXT)

def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.left_indent = Inches(0.22 + level * 0.18)
        p.paragraph_format.space_after = Pt(3)
        if isinstance(item, tuple):
            lead, rest = item
            r = p.add_run(lead)
            set_run_font(r, size=9.5, color=TEXT, bold=True)
            r = p.add_run(rest)
            set_run_font(r, size=9.5, color=TEXT)
        else:
            r = p.add_run(item)
            set_run_font(r, size=9.5, color=TEXT)

def add_note(doc, lead, text):
    p = doc.add_paragraph()
    p.paragraph_format.left_indent = Inches(0.16)
    p.paragraph_format.right_indent = Inches(0.16)
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(lead)
    set_run_font(r, size=9.5, color=NAVY, bold=True)
    r = p.add_run(text)
    set_run_font(r, size=9.5, color=TEXT)

def add_table(doc, headers, rows, widths=None, header_fill=NAVY, zebra=True, font_size=8.2):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    header = table.rows[0]
    mark_header_row(header)
    for idx, value in enumerate(headers):
        cell = header.cells[idx]
        set_cell_shading(cell, header_fill)
        set_cell_border(cell)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(str(value))
        set_run_font(r, size=font_size, color="FFFFFF", bold=True)
    for row_idx, row in enumerate(rows):
        cells = table.add_row().cells
        for idx, value in enumerate(row):
            cell = cells[idx]
            set_cell_shading(cell, LIGHT_GRAY if zebra and row_idx % 2 else "FFFFFF")
            set_cell_border(cell)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.12
            r = p.add_run(str(value))
            set_run_font(r, size=font_size, color=TEXT)
    if widths:
        for row in table.rows:
            for idx, width in enumerate(widths):
                row.cells[idx].width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table

def add_meta_table(doc, rows):
    table = doc.add_table(rows=0, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    for key, value in rows:
        cells = table.add_row().cells
        set_cell_shading(cells[0], LIGHT_BLUE)
        set_cell_shading(cells[1], "FFFFFF")
        for cell in cells:
            set_cell_border(cell)
            set_cell_margins(cell, top=90, bottom=90)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cells[0].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        set_run_font(p.add_run(key), size=9, color=NAVY, bold=True)
        p = cells[1].paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        set_run_font(p.add_run(value), size=9, color=TEXT)
    if table.rows:
        mark_header_row(table.rows[0])
    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def add_page_break(doc):
    doc.add_page_break()

def build_requirements():
    doc = setup_doc("AI 爆品参谋首期需求拆解文档")
    add_title(doc, "AI 爆品参谋首期需求拆解文档", "面向一次性电子烟产品的机会评估与证据报告系统")
    add_intro(doc, "本文件用于明确首期产品要解决的问题、功能边界、数据与 RAG 方案、评分逻辑和验收标准。首期产品的目标是帮助业务团队判断一个待上市成品是否值得进入验证阶段，而不是承诺预测实际销量。")
    add_meta_table(doc, [("文档定位", "首期产品需求拆解与研发对齐文档"), ("首期产品", "AI 爆品参谋"), ("首期品类", "一次性电子烟"), ("首期输出", "机会评分、置信度、证据报告和 PDF"), ("目标使用者", "道森产品、市场、研发和管理团队")])

    doc.add_heading("一 产品目标与边界", level=1)
    doc.add_heading("1.1 产品目标", level=2)
    add_bullets(doc, [
        ("输入一个成品：", "用户上传产品图片并填写规格、价格和目标市场。"),
        ("汇总已有数据：", "系统检索政策、竞品、海关、供应链、工厂和新闻信号。"),
        ("形成可解释判断：", "输出六维机会评分、合规结论、风险和证据来源。"),
        ("保留决策记录：", "输入、数据快照、评分版本、报告和专家反馈保持关联。"),
    ])
    doc.add_heading("1.2 首期不解决的问题", level=2)
    add_bullets(doc, [
        "不承诺预测精确销量、利润或市场份额。",
        "不替代当地法律、合规或认证意见。",
        "不在首期实现全品类产品统一模型。",
        "不在首期接入复杂的社交媒体趋势预测和零售商地图。",
        "不让大模型直接决定最终分数。",
    ])
    add_note(doc, "首期原则：", "先做可复现的证据型决策辅助，再根据真实业务反馈扩展为可回测的预测产品。")

    doc.add_heading("二 用户与核心流程", level=1)
    add_table(doc, ["步骤", "用户动作", "系统动作", "产出"], [
        ("1 创建任务", "进入新建评估并选择目标市场", "创建评估任务和版本记录", "任务 ID"),
        ("2 提交产品", "上传 1 至 6 张图片并填写必填参数", "校验文件和字段完整性", "ProductInput"),
        ("3 确认特征", "确认或修正 AI 识别的视觉特征", "保存人工确认结果", "VisualTraits"),
        ("4 建立证据链", "等待 Agent 分析", "查询政策、竞品、贸易、供应链和新闻数据", "Evidence[]"),
        ("5 计算评分", "查看任务状态", "规则引擎计算六维分数和置信度", "ScoreResult"),
        ("6 阅读报告", "查看机会、风险、证据和假设", "生成中英双语报告", "Report"),
        ("7 反馈决策", "采纳、驳回或备注", "记录专家标签", "ExpertFeedback"),
    ], widths=[0.8, 2.0, 2.7, 1.4])

    doc.add_heading("三 产品需求清单", level=1)
    doc.add_heading("3.1 P0 核心功能", level=2)
    add_table(doc, ["编号", "功能模块", "需求内容", "完成判断"], [
        ("P0-01", "产品输入", "图片、产品名、市场、口数、烟油容量、尼古丁、口味、目标零售价", "字段校验通过后可创建任务"),
        ("P0-02", "图片理解", "提取颜色、结构、屏幕、材质感和外形特征", "用户可以确认或删除识别标签"),
        ("P0-03", "市场政策", "查询市场准入、尼古丁、容量、口味、包装和渠道规则", "报告展示规则及来源日期"),
        ("P0-04", "竞品匹配", "按市场、口数、容量、价格和视觉标签找相似产品", "报告展示至少 3 条可用对标"),
        ("P0-05", "六维评分", "按固定权重计算市场、竞争、差异化、合规、供应链和商业分数", "相同输入可复现相同分数"),
        ("P0-06", "合规硬门槛", "禁售、超限或禁限口味直接阻断", "触发时结论为 NO-GO"),
        ("P0-07", "机会报告", "总分、置信度、六维结构、机会、风险、假设和证据", "网页报告可完整查看"),
        ("P0-08", "数据质量", "显示来源、记录日期、快照版本和不可用数据", "缺失数据不被静默补全"),
    ], widths=[0.65, 1.1, 3.6, 1.55])
    doc.add_heading("3.2 P1 增强功能", level=2)
    add_table(doc, ["编号", "功能模块", "价值", "建议时机"], [
        ("P1-01", "PDF 导出", "用于客户沟通、内部评审和归档", "核心流程打通后"),
        ("P1-02", "专家反馈", "记录采纳、驳回和最终业务动作", "首个可演示版本"),
        ("P1-03", "评分配置", "按市场调整权重和阈值", "规则稳定后"),
        ("P1-04", "英文报告", "支持海外客户和投资人演示", "中文报告稳定后"),
    ], widths=[0.75, 1.4, 3.0, 1.75])

    add_page_break(doc)
    doc.add_heading("四 数据库与 RAG 需求", level=1)
    doc.add_heading("4.1 数据职责边界", level=2)
    add_table(doc, ["层次", "负责内容", "不负责内容"], [
        ("数据库", "存储政策、产品、竞品、海关、供应链、工厂、新闻、评估和证据元数据", "不直接生成最终评分解释"),
        ("RAG", "切分文档、召回相关证据、按市场和时间重排、生成引用依据", "不直接决定总分和 Go/No-Go"),
        ("评分引擎", "根据结构化字段、规则和证据计算六维分数", "不自行编造缺失数据"),
        ("报告生成", "把评分和证据转为中英双语可读报告", "不修改评分结果"),
    ], widths=[1.2, 3.5, 2.5])
    doc.add_heading("4.2 首期数据对象", level=2)
    add_table(doc, ["对象", "核心字段", "参与方式"], [
        ("MarketPolicy", "市场代码、准入、尼古丁、容量、口味、包装、渠道、来源日期", "结构化查询和合规硬门槛"),
        ("Product", "品牌、名称、图片、口数、容量、特征、市场", "竞品匹配和产品对标"),
        ("CustomsTrade", "HS 编码、市场、年度、金额、来源和更新时间", "市场需求趋势"),
        ("SupplierFactory", "企业类型、资质、市场、研发、产能线索、来源", "供应链可行性"),
        ("NewsArticle", "标题、摘要、监管信号、影响、市场、发布时间、来源", "RAG 召回和风险解释"),
        ("Evidence", "来源、链接、市场、记录日期、快照日期、质量、是否参与评分", "报告追溯"),
    ], widths=[1.25, 4.0, 1.95])
    doc.add_heading("4.3 RAG 检索规则", level=2)
    add_bullets(doc, [
        ("先结构化后语义：", "政策上限、口数、容量和价格优先查询结构化数据库；政策解释和新闻影响使用 RAG。"),
        ("市场过滤：", "所有检索必须带目标市场，禁止用其他国家的政策替代当前市场。"),
        ("时间排序：", "同类证据优先使用更新时间更近的记录，并保留过期记录作为历史参考。"),
        ("来源质量：", "官方或高质量来源优先；低质量来源只能作为线索，不能单独触发硬门槛。"),
        ("引用强制：", "RAG 返回 evidence_id、来源、日期和摘要，报告不得输出无来源的关键结论。"),
    ])

    doc.add_heading("五 评分与报告规则", level=1)
    add_table(doc, ["维度", "权重", "主要输入", "特殊规则"], [
        ("市场需求", "25%", "海关趋势、新闻信号、市场活跃度", "贸易额不等于终端销量"),
        ("竞争机会", "20%", "竞品数量、规格拥挤度、相似度", "输出对标产品而非销量排名"),
        ("产品差异化", "15%", "视觉标签、规格组合、相似度", "只使用已确认特征"),
        ("合规可行性", "20%", "市场政策和产品参数", "硬门槛优先，阻断时最高 39 分"),
        ("供应链可行性", "10%", "供应商、工厂、能力和资质线索", "不等于已签约产能"),
        ("商业可行性", "10%", "零售价、成本、MOQ、渠道", "成本缺失时标记证据不足"),
    ], widths=[1.25, 0.7, 3.2, 2.05])
    add_note(doc, "结论等级：", "总分 75 分以上为 GO，55 至 74 分为 REVIEW，低于 55 分为 NO-GO。置信度最高为中等，直到接入真实销量和历史项目标签。")

    doc.add_heading("六 非功能需求", level=1)
    add_table(doc, ["类别", "要求"], [
        ("可复现", "同一输入、数据快照和评分版本必须得到同一分数和结论。"),
        ("可追溯", "每项关键结论关联来源、市场、记录日期、快照日期和质量等级。"),
        ("安全", "OpenAI Key 只放在服务端；上传图片不进入第三方页面；云端可启用访问码。"),
        ("性能", "固定数据快照模式下，目标是在 3 分钟内完成一份报告。"),
        ("可用性", "页面刷新后可恢复评估状态；所有表单、空状态和错误状态都有提示。"),
        ("国际化", "网页支持中英切换，PDF 每个章节提供中文和英文内容。"),
    ], widths=[1.2, 6.0])

    doc.add_heading("七 验收标准", level=1)
    add_bullets(doc, [
        "UAE 合规样例可以完整生成六维报告、证据清单和 PDF。",
        "沙特 Coffee、Vanilla、Cola 等禁限口味样例触发合规硬门槛并输出 NO-GO。",
        "缺少目标成本时，商业可行性显示证据不足，置信度下降。",
        "每个关键结论都能展开来源、适用市场和日期。",
        "AI 识别结果必须允许用户删除或修改。",
        "评分数值不由大模型直接生成，报告文字不能覆盖规则引擎结果。",
        "中英文版本分数、事实和结论一致。",
        "首页、创建评估、报告、后台和 PDF 均通过测试负责人验收。",
    ])
    doc.add_heading("八 首期风险与后续升级", level=1)
    add_table(doc, ["风险", "首期处理", "后续升级"], [
        ("没有真实销量标签", "输出机会评分，不称为销量预测", "接入历史项目后做回测"),
        ("数据更新时间不一致", "展示警告并降低置信度", "建立统一更新任务和数据血缘"),
        ("RAG 召回错误市场", "强制市场过滤和测试用例", "增加跨市场隔离评估"),
        ("用户输入参数不完整", "降低置信度并标记缺失项", "引入行业默认值但保留人工确认"),
    ], widths=[2.0, 2.8, 2.4])
    return doc

def build_roles():
    doc = setup_doc("AI 爆品参谋团队分工与职责明确表")
    add_title(doc, "AI 爆品参谋团队分工与职责明确表", "七人团队首期研发组织、交付物和协作机制")
    add_intro(doc, "本文件用于明确七人团队在首期 AI 爆品参谋项目中的主责、协作、交付物和验收边界。采用 DRI 主责制：每个交付物只有一个最终负责人，但必须经过相关角色协作和评审。")
    add_meta_table(doc, [("团队规模", "7 人"), ("首期产品", "AI 爆品参谋"), ("组织方式", "能力主责 + 交付物 DRI + 双人评审"), ("技术负责人", "项目发起人负责架构、集成、评审和发布"), ("关键分工", "数据库由后端与数据工程师负责；RAG 由 AI Agent 与评分工程师负责")])

    doc.add_heading("一 团队角色总览", level=1)
    add_table(doc, ["人员", "角色", "主责方向", "首期核心交付物"], [
        ("成员1", "技术负责人 / 架构与集成", "架构、接口、安全、代码评审、联调、发布", "技术方案、接口契约、版本准入"),
        ("成员2", "UI/UX 设计师", "流程、界面、设计系统、报告信息层级", "高保真稿、组件规范、状态设计"),
        ("成员3", "测试负责人", "测试策略、数据用例、回归、验收", "测试计划、用例、缺陷报告、验收结论"),
        ("成员4", "产品需求负责人", "需求对接、PRD、优先级、验收标准", "需求拆解、字段字典、版本范围"),
        ("成员5", "前端应用工程师", "页面、交互、报告展示、前端 API 接入", "新建评估、报告、后台页面"),
        ("成员6", "数据库与数据工程师", "数据库、数据清洗、快照、数据 API、PDF", "PostgreSQL/pgvector、数据适配层、存储接口"),
        ("成员7", "AI Agent 与评分工程师", "图片识别、RAG、证据抽取、评分引擎", "Vision、RAG、六维评分、报告 JSON"),
    ], widths=[0.65, 1.65, 2.7, 2.25])
    add_note(doc, "角色要求：", "成员1不应只承担技术支持，而应作为技术负责人，拥有架构、接口和发布决策权；否则数据库、RAG和前端很容易形成彼此不兼容的实现。")

    doc.add_heading("二 详细职责明确表", level=1)
    add_table(doc, ["角色", "负责", "不负责", "完成标准"], [
        ("技术负责人", "架构、模块边界、技术选型、安全、代码评审、联调、发布", "不替代每位成员完成全部开发", "主流程可运行，接口和版本可追溯"),
        ("UI/UX", "用户流程、页面结构、设计令牌、组件、错误和空状态", "不决定评分逻辑和数据库字段", "开发可直接依据设计稿实现"),
        ("测试负责人", "测试计划、用例、回归、评分一致性、合规测试、PDF 检查", "不替产品做需求决策", "关键 P0 用例通过，阻断缺陷关闭"),
        ("产品负责人", "业务目标、需求、优先级、验收口径、客户反馈", "不直接指定技术实现细节", "PRD 和验收标准无歧义"),
        ("前端工程师", "上传、表单、分析状态、报告、证据、国际化和响应式", "不在前端计算最终分数", "页面可用、状态完整、API 错误可提示"),
        ("数据库与数据工程师", "表结构、清洗、导入、版本、API、存储、PDF", "不负责 Prompt 和 RAG 召回策略", "事实可查、来源可追踪、数据可复现"),
        ("AI/RAG 工程师", "图片识别、文档切分、召回、重排、证据结构化、评分", "不让大模型直接输出最终总分", "证据相关、评分可复现、无来源不输出"),
    ], widths=[1.35, 2.7, 2.0, 1.2], font_size=7.8)

    doc.add_heading("三 数据库与 RAG 专项分工", level=1)
    add_table(doc, ["任务", "主责", "协作", "交付结果"], [
        ("数据库表结构", "数据库与数据工程师", "技术负责人、产品负责人", "markets、policies、products、evidence 等表"),
        ("数据清洗与标准化", "数据库与数据工程师", "产品负责人、AI 工程师", "统一市场、单位、日期、品牌和产品字段"),
        ("数据快照与版本", "数据库与数据工程师", "测试负责人", "snapshot_id、source_date、quality、data_version"),
        ("结构化查询接口", "数据库与数据工程师", "前端、AI 工程师", "政策、竞品、贸易、供应链查询 API"),
        ("文档切分与向量化", "AI/RAG 工程师", "数据库与数据工程师", "文本 chunk、embedding、metadata"),
        ("混合检索与重排", "AI/RAG 工程师", "数据库与数据工程师", "关键词 + 向量 + 市场 + 时间过滤"),
        ("证据结构化", "AI/RAG 工程师", "产品、测试负责人", "evidence_id、claim、source、date、quality"),
        ("最终评分", "AI/RAG 工程师", "技术负责人、测试负责人", "确定性六维评分和硬门槛"),
    ], widths=[2.0, 1.6, 1.8, 1.85], font_size=7.8)
    add_note(doc, "边界原则：", "数据库保存事实，RAG 负责找依据，评分引擎负责计算分数，报告生成负责表达。任何一层都不能越权替代另一层。")

    add_page_break(doc)
    doc.add_heading("四 交付物与 DRI", level=1)
    add_table(doc, ["交付物", "DRI", "必须协作", "验收人"], [
        ("首期 PRD 和字段字典", "产品负责人", "技术、数据库、AI、测试", "成员1 + 业务代表"),
        ("用户流程和视觉稿", "UI/UX", "产品、前端、测试", "产品负责人"),
        ("数据库和数据快照", "数据库工程师", "产品、AI、测试", "成员1"),
        ("RAG 检索服务", "AI/RAG 工程师", "数据库、技术、测试", "成员1 + 测试负责人"),
        ("六维评分引擎", "AI/RAG 工程师", "产品、数据库、测试", "产品负责人 + 成员1"),
        ("前端评估闭环", "前端工程师", "UI、后端、产品、测试", "产品负责人"),
        ("PDF 报告", "数据库工程师", "前端、UI、测试", "产品负责人"),
        ("测试与验收报告", "测试负责人", "全体 DRI", "成员1 + 产品负责人"),
        ("集成发布版本", "技术负责人", "全体成员", "全体评审"),
    ], widths=[2.2, 1.4, 2.5, 1.4], font_size=8)

    doc.add_heading("五 协作机制", level=1)
    doc.add_heading("5.1 会议和沟通节奏", level=2)
    add_table(doc, ["节奏", "参与人", "目的", "输出"], [
        ("周一计划会", "全体", "确认本周目标、依赖和风险", "任务板和负责人"),
        ("周三同步会", "技术、产品、三位开发、测试", "解决阻塞，不做长汇报", "阻塞清单和决策"),
        ("周五 Demo", "全体 + 业务代表", "展示可运行成果和问题", "演示记录、验收意见"),
        ("每周技术评审", "成员1、后端、AI、前端", "检查接口、数据和实现边界", "评审结论"),
        ("版本验收", "产品、测试、技术", "确认是否可进入下一阶段", "发布或退回清单"),
    ], widths=[1.2, 1.4, 3.1, 1.8])
    doc.add_heading("5.2 工作方式", level=2)
    add_bullets(doc, [
        ("一个交付物一个 DRI：", "避免多人负责、无人负责。"),
        ("接口先行：", "数据库、RAG、评分和前端先确定 JSON 契约，再并行开发。"),
        ("双人评审：", "关键代码至少由另一位计算机专业成员评审；评分和合规规则必须由产品与测试参与。"),
        ("小步演示：", "每两周必须形成可运行版本，不等待所有功能完成。"),
        ("问题可追踪：", "需求、缺陷、数据问题和决策均绑定任务 ID 或版本号。"),
    ])

    doc.add_heading("六 首期开发计划", level=1)
    add_table(doc, ["阶段", "时间", "重点目标", "主要负责人"], [
        ("阶段 1 需求与契约", "第 1 周", "PRD、字段字典、数据模型、评分规则、页面流程", "产品、成员1、UI、数据库、AI"),
        ("阶段 2 页面与数据骨架", "第 2 周", "上传表单、报告骨架、数据快照、基础 API", "前端、数据库、UI"),
        ("阶段 3 AI 与评分", "第 3 周", "图片识别、RAG、竞品匹配、合规硬门槛、评分", "AI、数据库、成员1、测试"),
        ("阶段 4 全链路闭环", "第 4 周", "从上传到报告、证据展示、PDF、中英文", "前端、后端、AI"),
        ("阶段 5 测试与演示", "第 5 周", "UAE/沙特样例、回归、修复、客户演示", "测试、产品、全体"),
    ], widths=[1.5, 0.9, 3.2, 1.9])

    doc.add_heading("七 Definition of Done", level=1)
    add_bullets(doc, [
        "功能有明确需求编号和验收标准。",
        "代码已完成同行评审，接口文档已更新。",
        "数据有来源、市场、日期、质量和版本。",
        "RAG 结果包含 evidence_id，不能只返回无来源文本。",
        "评分逻辑有可重复测试，合规硬门槛有正反例。",
        "前端有成功、加载、空状态、错误和禁用状态。",
        "测试负责人确认 P0 用例通过，产品负责人确认业务口径正确。",
        "技术负责人确认可以合并到演示版本。",
    ])
    doc.add_heading("八 责任矩阵 RACI", level=1)
    add_table(doc, ["工作项", "产品", "UI", "前端", "数据库", "AI/RAG", "测试", "技术"], [
        ("需求与验收", "A/R", "C", "C", "C", "C", "C", "A"),
        ("页面设计", "A", "R", "C", "I", "I", "C", "C"),
        ("数据库和快照", "C", "I", "C", "R", "C", "C", "A"),
        ("RAG 检索", "C", "I", "C", "C", "R", "C", "A"),
        ("评分引擎", "A", "I", "I", "C", "R", "C", "A"),
        ("前端闭环", "C", "C", "R", "C", "C", "C", "A"),
        ("测试验收", "C", "C", "C", "C", "C", "R", "A"),
        ("发布上线", "C", "I", "C", "C", "C", "C", "A/R"),
    ], widths=[1.4, 0.55, 0.42, 0.55, 0.65, 0.65, 0.55, 0.55], font_size=7.5)
    add_note(doc, "RACI 说明：", "R = Responsible 执行，A = Accountable 最终负责，C = Consulted 协作，I = Informed 知会。")
    return doc

if __name__ == "__main__":
    req = build_requirements()
    req.save(OUT / "DAWSEN_AI_爆品参谋_首期需求拆解文档.docx")
    roles = build_roles()
    roles.save(OUT / "DAWSEN_AI_爆品参谋_团队分工与职责明确表.docx")
    print(OUT / "DAWSEN_AI_爆品参谋_首期需求拆解文档.docx")
    print(OUT / "DAWSEN_AI_爆品参谋_团队分工与职责明确表.docx")
