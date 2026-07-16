import os
import time
import win32com.client

def check_field_results(doc_path):
    os.system("taskkill /F /IM WINWORD.EXE 2>nul")
    time.sleep(1)
    
    word = win32com.client.dynamic.Dispatch("Word.Application")
    word.Visible = False
    
    try:
        doc = word.Documents.Open(os.path.abspath(doc_path))
        
        # Force repagination
        doc.Repaginate()
        
        for idx in [10, 12, 13]:
            if idx <= doc.Sections.Count:
                sec = doc.Sections(idx)
                footer = sec.Footers(1)
                print(f"\n--- Section {idx} Footer ---")
                print(f"  Footer Range.Text: {repr(footer.Range.Text.strip())}")
                print(f"  Fields Count: {footer.Range.Fields.Count}")
                for f_idx in range(1, footer.Range.Fields.Count + 1):
                    f = footer.Range.Fields(f_idx)
                    try:
                        print(f"    Field {f_idx}: Result.Text={repr(f.Result.Text.strip())}, Type={f.Type}")
                    except Exception as fe:
                        print(f"    Field {f_idx}: Error reading Result: {fe}")
            else:
                print(f"Section {idx} not found.")
                
        doc.Close(False)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        word.Quit()

if __name__ == '__main__':
    check_field_results(r"C:\Users\Jatin\Documents\Locser_Report_50pg_Modified.docx")
