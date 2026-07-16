import os
import time
import win32com.client

def inspect_styles(doc_path):
    os.system("taskkill /F /IM WINWORD.EXE 2>nul")
    time.sleep(1)
    
    word = win32com.client.dynamic.Dispatch("Word.Application")
    word.Visible = False
    
    try:
        doc = word.Documents.Open(os.path.abspath(doc_path))
        print(f"Document: {doc.Name}")
        print(f"Total Paragraphs: {doc.Paragraphs.Count}")
        
        # Let's inspect a sample of 30 paragraphs
        print("\n--- Style Sample of First 50 Paragraphs ---")
        for i in range(1, min(51, doc.Paragraphs.Count + 1)):
            p = doc.Paragraphs(i)
            text = p.Range.Text.strip()
            if not text:
                print(f"P{i}: [EMPTY]")
                continue
                
            style = p.Style.NameLocal
            font_name = p.Range.Font.Name
            font_size = p.Range.Font.Size
            alignment = p.Alignment # 0=Left, 1=Center, 2=Right, 3=Justify
            
            print(f"P{i}: Style={style}, Font={font_name}, Size={font_size}pt, Align={alignment}")
            print(f"  Text: {repr(text[:120])}")
            
        doc.Close(False)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        word.Quit()

if __name__ == '__main__':
    inspect_styles(r"C:\Users\Jatin\Documents\Locser_Report_50pg_Modified.docx")
