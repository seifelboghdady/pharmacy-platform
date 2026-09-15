import 'package:flutter/material.dart';
import 'package:iconsax/iconsax.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/network/api_service.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/primary_button.dart';
import '../data/users_repository.dart';

class AddEmployeeScreen extends StatefulWidget {
  final String pharmacyName;
  const AddEmployeeScreen({super.key, required this.pharmacyName});
  @override State<AddEmployeeScreen> createState() => _AddEmployeeScreenState();
}
class _AddEmployeeScreenState extends State<AddEmployeeScreen> {
  final name = TextEditingController(), email = TextEditingController(), phone = TextEditingController(), password = TextEditingController();
  bool loading = false;
  @override void dispose(){ name.dispose(); email.dispose(); phone.dispose(); password.dispose(); super.dispose(); }
  Future<void> save() async {
    if (loading) return;
    if (name.text.trim().isEmpty || email.text.trim().isEmpty || phone.text.trim().isEmpty || password.text.length < 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please fill all fields. Password must be at least 6 characters.'))); return;
    }
    setState(()=>loading=true);
    try {
      await UsersRepository().addEmployee(name:name.text,email:email.text,password:password.text,phone:phone.text,pharmacyName:widget.pharmacyName);
      if(!mounted)return; ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Employee added successfully'))); Navigator.pop(context,true);
    } catch(e) { if(!mounted)return; ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(ApiService.friendlyError(e)))); }
    finally { if(mounted)setState(()=>loading=false); }
  }
  @override Widget build(BuildContext context)=>Scaffold(
    appBar: AppBar(title: const Text('Add Employee'), leading: IconButton(onPressed:()=>Navigator.pop(context),icon:const Icon(Iconsax.arrow_left_2))),
    body: SafeArea(child:SingleChildScrollView(padding:const EdgeInsets.all(20),child:Column(crossAxisAlignment:CrossAxisAlignment.start,children:[
      const Text('Employee Information',style:TextStyle(fontSize:18,fontWeight:FontWeight.w800)),const SizedBox(height:6),
      const Text('Add a team member to your pharmacy.',style:TextStyle(color:AppColors.textGrey)),const SizedBox(height:24),
      AppTextField(label:'Full Name',hint:'Employee name',controller:name),const SizedBox(height:16),
      AppTextField(label:'Email',hint:'employee@example.com',controller:email),const SizedBox(height:16),
      AppTextField(label:'Phone',hint:'01xxxxxxxxx',controller:phone),const SizedBox(height:16),
      AppTextField(label:'Password',hint:'At least 6 characters',controller:password,obscureText:true),const SizedBox(height:28),
      PrimaryButton(label:'Add Employee',isLoading:loading,onPressed:save),
    ]))),
  );
}
